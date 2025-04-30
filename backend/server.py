from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import json
import os
from lida import llm, Manager
import base64
from PIL import Image
import logging
import seaborn as sns
import matplotlib.pyplot as plt
import time
from datetime import datetime
from logging.handlers import RotatingFileHandler
import traceback

os.makedirs('logs', exist_ok=True)

log_file = f'logs/lida_api_{datetime.now().strftime("%Y%m%d")}.log'
file_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)  # 10MB per file, 5 backups max
console_handler = logging.StreamHandler()

log_format = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
file_formatter = logging.Formatter(log_format)
file_handler.setFormatter(file_formatter)
console_handler.setFormatter(logging.Formatter(log_format))

logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    handlers=[file_handler, console_handler]
)

logger = logging.getLogger("lida-chart-api")

app = FastAPI(title="LIDA Chart Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Initializing LIDA Manager and LLM")
start_time = time.time()
text_gen= llm(provider="hf", model="microsoft/Phi-4-mini-instruct", device_map="auto")
lida_manager= Manager(text_gen=text_gen)
logging.info(f"LIDA Manager initialized on {time.time() - start_time:.2f} seconds")

temp_datasets= {}
prompt_history= []

SAMPLE_DATASETS = {
    "titanic": "https://raw.githubusercontent.com/datasciencedojo/datasets/refs/heads/master/titanic.csv",
    "iris": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv",
    "penguins": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv"
}
class ChartRequest(BaseModel):
    prompt: str
    dataset_key: Optional[str] = None
    dataset_url: Optional[str] = None

class EditRequest(BaseModel):
    chart_id: str
    instructions: List[str]

class ChartResponse(BaseModel):
    chart_id: str
    image_data: str
    code: str
    summary: dict

@app.post("/api/upload-dataset")
async def upload_dataset(file: UploadFile= File(...)):
    logger.info(f"Received dataset upload request: {file.filename}")
    start_time = time.time()
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    try:
        content = await file.read()
        logger.info(f"File read complete, size: {len(content)} bytes")
        load_start = time.time()
        if file.filename.endswith('.csv'):
            df= pd.read_csv(io.BytesIO(content))
        else:
            df= pd.read_excel(io.BytesIO(content))
        logger.info(f"Dataset loaded in {time.time() - load_start:.2f}")
        
        dataset_key = f"uploaded_{len(temp_datasets) + 1}"
        temp_datasets[dataset_key] = df
        summary_start = time.time()
        summary = lida_manager.summarize(df, summary_method="default")

        logger.info(f"Dataset summarized in {time.time() - summary_start:.2f} seconds")
        
        total_time = time.time() - start_time
        logger.info(f"Upload dataset completed in {total_time:.2f} seconds")
        return {
            "dataset_key": dataset_key,
            "columns": df.columns.tolist(),
            "rows": len(df),
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/sample-datasets")
async def get_sample_datasets():
    return {"datasets": list(SAMPLE_DATASETS.keys())}

@app.post("/api/generate-chart")
async def generate_chart(request: ChartRequest):
    try:
        if request.dataset_key:
            if request.dataset_key in temp_datasets:
                data = temp_datasets[request.dataset_key]
                summary = lida_manager.summarize(data, summary_method="default")
                logging.info(f"Generated summary{summary}")
            elif request.dataset_key in SAMPLE_DATASETS:
                url = SAMPLE_DATASETS[request.dataset_key]
                summary = lida_manager.summarize(url, summary_method="default")
            else:
                raise HTTPException(status_code=404, detail="Dataset not found")
        elif request.dataset_url:
            summary = lida_manager.summarize(request.dataset_url, summary_method="default")
            logging.info(f"Generated summary{summary}")

        else:
            raise HTTPException(status_code=400, detail="Either dataset_key or dataset_url must be provided")

        logging.info("---------------------Charts section -----------------------")
        charts = lida_manager.visualize(summary=summary, goal=request.prompt, library="seaborn")
        logging.info("------------------------ After charts section -----------------")
        if not charts:
            raise HTTPException(status_code=400, detail="No charts could be generated from this prompt")
        
        chart = charts[0]
        plt.figure(figsize=(10, 6))
        data = temp_datasets[request.dataset_key] if request.dataset_key in temp_datasets else pd.read_csv(SAMPLE_DATASETS[request.dataset_key] if request.dataset_key in SAMPLE_DATASETS else request.dataset_url)
        exec(charts[0].code)
        
        img_bytes = io.BytesIO()
        plt.savefig(img_bytes, format='png', bbox_inches='tight')
        plt.close()
        img_bytes.seek(0)
        
        base64_str = base64.b64encode(img_bytes.read()).decode('utf-8')
        
        chart_id = f"chart_{len(prompt_history) + 1}"
        
        chart_data = {
            "id": chart_id,
            "prompt": request.prompt,
            "dataset": request.dataset_key or request.dataset_url,
            "code": chart.code,
            "image_data": base64_str,
            "summary": summary
        }
        logging.info(f"chart details{chart_data}")
        prompt_history.append(chart_data)
        logging.info("------------------------SENDING-----------------------------")
        return {
            "chart_id": chart_id,
            "image_data": f"data:image/png;base64,{base64_str}",
            "code": chart.code,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chart: {str(e)}")

@app.post("/api/edit-chart")
async def edit_chart(request: EditRequest):
    try:
        chart_data = None
        for item in prompt_history:
            if item["id"] == request.chart_id:
                chart_data = item
                break
        
        if not chart_data:
            raise HTTPException(status_code=404, detail="Chart not found")
        
        dataset_source = chart_data.get("dataset")
        if dataset_source in temp_datasets:
            data = temp_datasets[dataset_source]
        elif dataset_source in SAMPLE_DATASETS:
            data = pd.read_csv(SAMPLE_DATASETS[dataset_source])
        elif dataset_source and dataset_source.startswith('http'):
            data = pd.read_csv(dataset_source)
        else:
            pass
        
        edited_charts = lida_manager.edit(
            code=chart_data["code"],
            summary=chart_data["summary"],
            instructions=request.instructions,
            library="seaborn"
        )
        
        if not edited_charts:
            raise HTTPException(status_code=400, detail="Failed to edit chart")
        
        plt.figure(figsize=(10, 6))
        exec(edited_charts[0].code)
        
        img_bytes = io.BytesIO()
        plt.savefig(img_bytes, format='png', bbox_inches='tight')
        plt.close()
        img_bytes.seek(0)
        
        base64_str = base64.b64encode(img_bytes.read()).decode('utf-8')
        
        chart_id = f"chart_{len(prompt_history) + 1}"
        
        chart_data = {
            "id": chart_id,
            "prompt": f"Edit of {request.chart_id}",
            "instructions": request.instructions,
            "code": edited_charts[0].code,
            "image_data": base64_str,
            "summary": chart_data["summary"],
            "dataset": chart_data.get("dataset", "") 
        }
        prompt_history.append(chart_data)
        
        return {
            "chart_id": chart_id,
            "image_data": f"data:image/png;base64,{base64_str}",
            "code": edited_charts[0].code,
            "summary": chart_data["summary"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error editing chart: {str(e)}")

@app.get("/api/history")
async def get_history():
    return {"history": [
        {
            "id": item["id"],
            "prompt": item["prompt"],
            "image_data": f"data:image/png;base64,{item['image_data']}",
            "dataset": item.get("dataset", "")
        } for item in prompt_history
    ]}

@app.get("/api/export/{chart_id}")
async def export_chart(chart_id: str, format: str = Query("png", enum=["png", "svg", "json"])):
    data = temp_datasets[request.dataset_key] if request.dataset_key in temp_datasets else pd.read_csv(SAMPLE_DATASETS[request.dataset_key] if request.dataset_key in SAMPLE_DATASETS else request.dataset_url)
    chart_data = None
    for item in prompt_history:
        if item["id"] == chart_id:
            chart_data = item
            break
    
    if not chart_data:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    if format == "json":
        return JSONResponse(content={
            "prompt": chart_data["prompt"],
            "code": chart_data["code"],
            "dataset": chart_data.get("dataset", ""),
            "instructions": chart_data.get("instructions", [])
        })
    elif format == "png":
        return {"image_data": f"data:image/png;base64,{chart_data['image_data']}"}
    elif format == "svg":
        plt.figure(figsize=(10, 6))
        exec(chart_data["code"])
        
        img_bytes = io.BytesIO()
        plt.savefig(img_bytes, format='svg', bbox_inches='tight')
        plt.close()
        img_bytes.seek(0)
        
        base64_str = base64.b64encode(img_bytes.read()).decode('utf-8')
        
        return {"image_data": f"data:image/svg+xml;base64,{base64_str}"}

@app.get("/api/suggestions/{prompt}")
async def get_prompt_suggestions(prompt: str):
    try:
        suggestions = [
            f"Try '{prompt} by category'",
            f"Consider '{prompt} over time'",
            f"How about '{prompt} with trendline'",
            f"Maybe '{prompt} as percentage'"
        ]
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating suggestions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)
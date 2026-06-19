import os
import json
from huggingface_hub import hf_hub_download

# Lazy load Llama to avoid import errors if not installed
_llama_instance = None

def get_llama_instance():
    global _llama_instance
    if _llama_instance is None:
        try:
            from llama_cpp import Llama
        except ImportError:
            print("llama-cpp-python not installed. Using mock LLM.")
            return None

        model_dir = os.path.join(os.path.dirname(__file__), "..", "data", "models")
        os.makedirs(model_dir, exist_ok=True)
        
        repo_id = "Qwen/Qwen1.5-0.5B-Chat-GGUF"
        filename = "qwen1_5-0_5b-chat-q4_k_m.gguf"
        
        print(f"Ensuring LLM model {filename} is downloaded...")
        model_path = hf_hub_download(repo_id=repo_id, filename=filename, local_dir=model_dir)
        
        print(f"Loading LLM from {model_path}...")
        _llama_instance = Llama(
            model_path=model_path,
            n_ctx=1024,
            verbose=False
        )
    return _llama_instance

def explain_bias_report(subgroup_results: dict) -> str:
    llm = get_llama_instance()
    
    prompt = (
        "<|im_start|>system\n"
        "You are an assistant for the Maliba Ministry of Health. In exactly two simple sentences, summarize this AI bias report for a non-technical manager. Highlight which patient groups are harmed.<|im_end|>\n"
        "<|im_start|>user\n"
        f"Bias Report JSON:\n{json.dumps(subgroup_results, indent=2)}\n<|im_end|>\n"
        "<|im_start|>assistant\n"
    )

    if llm is None:
        # Fallback if llama-cpp-python fails to install
        failed_groups = [k for k, v in subgroup_results.items() if v.get('disparate_impact_ratio', 1.0) < 0.8]
        if failed_groups:
            return f"The AI system shows significant bias against the following groups: {', '.join(failed_groups)}. These populations may receive unfair treatment or misdiagnoses if the system is deployed."
        return "The AI system passed all bias checks across measured demographic groups. No significant harm or disparity was detected."

    response = llm(
        prompt,
        max_tokens=100,
        stop=["<|im_end|>"],
        temperature=0.1
    )
    
    summary = response["choices"][0]["text"].strip()
    return summary

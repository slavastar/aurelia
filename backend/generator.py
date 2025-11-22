import os
import yaml
import random
from dotenv import load_dotenv
from openai import OpenAI

def load_config(config_path):
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

def load_prompt(prompt_path):
    with open(prompt_path, 'r') as file:
        return file.read()

def select_option(options):
    choices = [item['option'] for item in options]
    weights = [item['weight'] for item in options]
    return random.choices(choices, weights=weights, k=1)[0]

def generate_person_data(iteration, config, prompt_template, client):
    # Select random demographics
    skin_color = select_option(config['skin_color'])
    alcohol_habit = select_option(config['alcohol_habit'])
    smoking_habit = select_option(config['smoking_habit'])
    children_count = select_option(config['children_count'])
    country = select_option(config['country'])
    profession = select_option(config['profession'])
    family_revenues = select_option(config['family_revenues'])

    # Format prompt
    # The prompt has placeholders: skin color: {}, alcohol habit: {}, etc.
    # We need to ensure the order matches the prompt's structure.
    # Based on prompt.md:
    # skin color: {}
    # alcohol habit: {}
    # smoking habit: {}
    # children she totally had: {}
    # the country she lived: {}
    # her profession: {}
    # her family revenues: {}
    
    formatted_prompt = prompt_template.format(
        skin_color,
        alcohol_habit,
        smoking_habit,
        children_count,
        country,
        profession,
        family_revenues
    )

    print(f"Generating person {iteration}...")
    
    try:
        response = client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates synthetic medical data in JSON format."},
                {"role": "user", "content": formatted_prompt},
            ],
            max_tokens=40000, # Increased tokens for full CSV
            temperature=0.7,
            stream=True
        )
        
        full_content = ""
        print("Generating content: ", end="", flush=True)
        
        for chunk in response:
            if chunk.choices:
                delta = chunk.choices[0].delta
                if delta.content:
                    print(delta.content, end="", flush=True)
                    full_content += delta.content
        
        print("\n" + "-" * 40)
        
        content = full_content

        # Extract JSON content if wrapped in code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        output_path = f"backend/data/person_{iteration}.json"
        abs_path = os.path.abspath(output_path)
        print(f"Writing {len(content)} bytes to {abs_path}")
        
        with open(output_path, 'w') as f:
            f.write(content)
            
        print(f"Saved to {output_path}")
        
    except Exception as e:
        print(f"Error generating person {iteration}: {e}")
        import traceback
        traceback.print_exc()

def main():
    # Load environment variables
    load_dotenv("backend/.env")
    api_key = os.getenv("NETMIND_API_KEY")
    
    if not api_key:
        print("Error: NETMIND_API_KEY not found in backend/.env")
        return

    # Initialize client
    client = OpenAI(
        base_url="https://api.netmind.ai/inference-api/openai/v1",
        api_key=api_key,
    )

    # Load resources
    config = load_config("backend/config.yaml")
    prompt_template = load_prompt("backend/prompt.md")

    # Number of iterations
    iterations = 3 # Default to 5, can be changed

    for i in range(1, iterations + 1):
        generate_person_data(i, config, prompt_template, client)

if __name__ == "__main__":
    main()
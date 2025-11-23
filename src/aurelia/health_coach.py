"""AI Health Coach model with tool integration."""

import os
import json
import random
from typing import Dict, Any, Optional
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

from .schemas import HealthProfile, HealthReport, HealthReportWithMetadata
from .tools import SearchTools

load_dotenv()


class HealthCoach:
    """AI Health Coach with web search and research capabilities."""
    
    def __init__(self, model_name: str = "moonshotai/Kimi-K2-Instruct"):
        """Initialize the health coach with AI model."""
        self.client = OpenAI(
            base_url="https://api.netmind.ai/inference-api/openai/v1",
            api_key=os.getenv("NET_MIND_API_KEY"),
        )
        self.model_name = model_name
        self.health_profile: Optional[HealthProfile] = None
        self.messages = []
        self._init_tools()
    
    def _init_tools(self):
        """Initialize tool definitions for function calling."""
        self.web_search_tool = {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for health research, medical information, and evidence-based interventions. Returns relevant articles with URLs.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query for finding health information and research"
                        }
                    },
                    "required": ["query"]
                }
            }
        }
        
        self.reddit_search_tool = {
            "type": "function",
            "function": {
                "name": "reddit_search",
                "description": "Search Reddit health communities (r/Biohackers, r/Supplements, r/Longevity) for real-world experiences, practical protocols, and supplement reviews. Particularly useful for finding user experiences with specific interventions, supplement combinations, and lifestyle modifications. Returns posts with top community comments.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query for finding Reddit discussions"
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum number of posts to return (default: 5)",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    
    def set_health_profile(self, profile_dict: Dict[str, Any]):
        """Set user's health profile and initialize conversation context."""
        self.health_profile = HealthProfile(**profile_dict)
        
        profile_summary = self._format_profile(self.health_profile)
        
        system_message = {
            "role": "system",
            "content": f"""You are Aurelia, an expert AI Health Recommendation Coach specializing in personalized wellness and lifestyle improvements.

Your role is to analyze the user's health data and provide evidence-based, actionable recommendations to improve their health and longevity.

{profile_summary}

Guidelines:
1. Provide specific, personalized recommendations based on the user's health profile
2. Use web search to find latest research and evidence-based interventions - conduct AT LEAST 5-7 searches covering different aspects (biomarkers, supplements, lifestyle, protocols, monitoring)
3. ALWAYS cite sources with URLs for every recommendation and claim
4. Focus on lifestyle improvements: nutrition, exercise, sleep, stress management, and supplementation
5. Explain the reasoning behind each recommendation with references to their biomarkers
6. Prioritize interventions by impact and feasibility
7. Include specific protocols with dosages, frequencies, and durations
8. Always recommend consulting healthcare professionals for medical concerns
9. Consider the difference between chronological age and bioage when making recommendations
10. Format recommendations in a clear, actionable structure

RESEARCH REQUIREMENT: Before generating your final report, you MUST:
- Research the specific biomarkers mentioned (fasting glucose, HbA1c, etc.)
- Search for evidence-based supplement protocols
- Find lifestyle intervention studies
- Look up monitoring recommendations
- Verify dosage protocols from reliable sources

CRITICAL: Every recommendation, protocol, and claim MUST be supported with a source URL from web search. Format sources as: [Source: URL]

Your goal is to generate a comprehensive, evidence-based health optimization report with complete citations."""
        }
        
        self.messages = [system_message]
    
    def _format_profile(self, profile: HealthProfile) -> str:
        """Format health profile into readable summary."""
        parts = ["USER HEALTH PROFILE:"]
        
        age_diff = profile.bioage - profile.age
        bmi = profile.weight / ((profile.height/100) ** 2)
        
        parts.extend([
            f"\nAge: {profile.age} years",
            f"Biological Age: {profile.bioage:.1f} years (Delta: {age_diff:+.1f} years)",
            f"Height: {profile.height} cm, Weight: {profile.weight} kg, BMI: {bmi:.1f}",
            "\nLIFESTYLE FACTORS:"
        ])
        
        for key, value in profile.lifestyle_quiz.items():
            parts.append(f"  - {key}: {value}")
        
        parts.append("\nBLOOD TEST BIOMARKERS:")
        for marker, value in profile.biomarkers.items():
            parts.append(f"  - {marker}: {value}")
        
        return "\n".join(parts)
    
    def generate_recommendations(self, format: str = "text") -> str:
        """
        Generate health recommendations with research.
        
        Args:
            format: Output format - "text" or "json"
            
        Returns:
            Health recommendations as string
        """
        if not self.health_profile:
            return "Error: No health profile set. Call set_health_profile() first."
        
        # Store format for later use
        self.output_format = format
        
        if format == "json":
            prompt = """Based on my health profile, generate a comprehensive health optimization report.

CRITICAL REQUIREMENT: Your response MUST be a JSON object with EXACTLY these 4 top-level keys (no others):

{
  "health_assessment": {
    "bioage_gap": <float: difference between bioage and age>,
    "bioage_gap_description": "<string describing the gap>",
    "key_findings": [
      {
        "biomarker": "<biomarker name>",
        "value": "<value with unit>",
        "status": "elevated" | "low" | "normal" | "optimal",
        "concern_level": "low" | "medium" | "high"
      }
    ],
    "overall_health_status": "<summary>",
    "primary_risks": ["<risk1>", "<risk2>"]
  },
  "recommendations": [
    {
      "priority": <integer 1-10>,
      "category": "diet" | "exercise" | "sleep" | "stress" | "supplementation" | "medical",
      "title": "<recommendation title>",
      "action": "<specific action with dosage for supplements>",
      "rationale": "<why this helps>",
      "expected_timeline": "<when to see results>",
      "sources": [{"title": "<source title>", "url": "<URL>"}]
    }
  ],
  "lifestyle_interventions": {
    "diet": {
      "modifications": ["<change1>", "<change2>"],
      "rationale": "<why these changes>",
      "sources": [{"title": "<source title>", "url": "<URL>"}]
    },
    "exercise": {
      "modifications": ["<change1>", "<change2>"],
      "rationale": "<why these changes>",
      "sources": [{"title": "<source title>", "url": "<URL>"}]
    },
    "sleep": {
      "modifications": ["<change1>", "<change2>"],
      "rationale": "<why these changes>",
      "sources": [{"title": "<source title>", "url": "<URL>"}]
    }
  },
  "monitoring_plan": {
    "retest_biomarkers": ["<biomarker>"],
    "retest_timeline": "<when to retest>",
    "expected_improvements": [
      {
        "biomarker": "<biomarker name>",
        "expected_change": "<target value>",
        "timeline": "<when>"
      }
    ]
  }
}

IMPORTANT NOTES:
- Include supplements as recommendations with category "supplementation"
- For supplement recommendations, include specific dosage in the "action" field (e.g., "Take 5000 IU daily with food")
- EACH recommendation must have its own "sources" array with URLs from web search
- DO NOT add extra keys like "executive_summary", "priority_interventions", "supplement_protocol", or any other fields
- DO NOT nest the required keys inside other objects
- Use web search to find evidence for every recommendation"""
        else:
            prompt = "Based on my health profile, generate a comprehensive health optimization report with specific, actionable recommendations. Use web search to find the latest research and cite all sources with URLs."
        
        return self._generate_with_tools(prompt)
    
    def _generate_with_tools(self, prompt: str, max_iterations: int = 6) -> str:
        """Generate response with iterative tool calling."""
        try:
            self.messages.append({"role": "user", "content": prompt})
            
            max_iterations = max_iterations
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                print(f"\n[Research Step {iteration}/{max_iterations}]")
                
                # Manage message history
                messages_to_send = self._trim_messages()
                
                # Shuffle tools to avoid first-tool bias
                tools = [self.web_search_tool, self.reddit_search_tool]
                random.shuffle(tools)
                
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages_to_send,
                    tools=tools,
                    tool_choice="auto",
                    temperature=0.7,
                    max_tokens=4000,
                    timeout=180.0
                )
                
                response_message = response.choices[0].message
                tool_calls = response_message.tool_calls
                
                if tool_calls:
                    # Process tool calls
                    self._add_assistant_message(response_message, tool_calls)
                    self._execute_tool_calls(tool_calls)
                    
                    # Request synthesis if approaching limit (give model one more chance to respond)
                    if iteration >= max_iterations - 2:
                        print(f"\n[⚠ Approaching iteration limit - requesting final synthesis]")
                        format_instruction = ""
                        if hasattr(self, 'output_format') and self.output_format == "json":
                            format_instruction = " Return ONLY valid JSON matching the health report schema, no markdown formatting."
                        self.messages.append({
                            "role": "user",
                            "content": f"Based on all the research you've gathered so far, please provide your complete health optimization report now. Synthesize all findings into the requested format.{format_instruction}"
                        })
                    continue
                
                else:
                    # Final response received
                    self._add_final_message(response_message)
                    
                    if not response_message.content:
                        return "Error: Model returned empty response"
                    
                    print(f"  ✓ Response received ({len(response_message.content)} characters)")
                    return response_message.content
            
            # Failsafe: force final response
            return self._force_final_response()
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            return f"Error generating response: {str(e)}\n\nTraceback:\n{error_details}"
    
    def _trim_messages(self) -> list:
        """Keep system message + recent conversation to avoid token limits."""
        if len(self.messages) > 15:
            return [self.messages[0]] + self.messages[-12:]
        return self.messages
    
    def _add_assistant_message(self, response_message, tool_calls):
        """Add assistant message with tool calls to history."""
        assistant_message = {
            "role": "assistant",
            "content": response_message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": tc.type,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                }
                for tc in tool_calls
            ]
        }
        self.messages.append(assistant_message)
    
    def _add_final_message(self, response_message):
        """Add final assistant message to history."""
        self.messages.append({
            "role": "assistant",
            "content": response_message.content
        })
    
    def _execute_tool_calls(self, tool_calls):
        """Execute tool calls and add results to message history."""
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            if function_name == "web_search":
                query = function_args.get("query")
                print(f"  → Web Search: '{query}'")
                result = SearchTools.web_search(query)
                
                self.messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(result)
                })
            
            elif function_name == "reddit_search":
                query = function_args.get("query")
                max_results = function_args.get("max_results", 5)
                print(f"  → Reddit Search: '{query}'")
                result = SearchTools.reddit_search(query, max_results)
                
                self.messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(result)
                })
    
    def _force_final_response(self) -> str:
        """Force final response when iteration limit reached."""
        print(f"\n[⚠ Max iterations reached - forcing final response]")
        
        final_messages = [self.messages[0]] + self.messages[-10:]
        
        # Include format instruction if JSON was requested
        if hasattr(self, 'output_format') and self.output_format == "json":
            final_messages.append({
                "role": "user", 
                "content": "Please provide your complete health optimization report NOW in valid JSON format based on all research gathered. Return ONLY the JSON object, no markdown formatting."
            })
        else:
            final_messages.append({
                "role": "user", 
                "content": "Please provide your complete health optimization report now based on all research gathered."
            })
        
        # Add response_format if JSON mode
        api_params = {
            "model": self.model_name,
            "messages": final_messages,
            "temperature": 0.7,
            "max_tokens": 4000,
            "timeout": 180.0
        }
        if hasattr(self, 'output_format') and self.output_format == "json":
            api_params["response_format"] = {"type": "json_object"}
        
        final_response = self.client.chat.completions.create(**api_params)
        
        final_content = final_response.choices[0].message.content
        if final_content:
            print(f"  ✓ Final synthesis completed ({len(final_content)} characters)")
            return final_content
        else:
            return "Error: Unable to generate final response after maximum iterations"
    
    def _get_current_time(self) -> datetime:
        """Get current datetime."""
        return datetime.now()
    
    def save_report(self, report_content: str, format: str = "json") -> str:
        """
        Save health report to file with metadata.
        
        Args:
            report_content: The generated report content
            format: File format - "json" or "txt"
            
        Returns:
            Filename of saved report
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        extension = "json" if format == "json" else "txt"
        filename = f"health_report_{timestamp}.{extension}"
        
        if format == "json":
            try:
                # Try to parse as JSON
                report_json = json.loads(report_content)
                
                # Create full report with metadata
                full_report = HealthReportWithMetadata(
                    generated_at=datetime.now(),
                    health_profile=self.health_profile,
                    report=HealthReport(**report_json)
                )
                
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(full_report.model_dump_json(indent=2))
                    
            except json.JSONDecodeError:
                # If not valid JSON, save as text
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(report_content)
        else:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report_content)
        
        return filename

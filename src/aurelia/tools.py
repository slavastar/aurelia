"""Search tools for web and Reddit research."""

import json
import requests
from typing import Dict, Any, List
from ddgs import DDGS
from bs4 import BeautifulSoup


class SearchTools:
    """Collection of search tools for health research."""
    
    @staticmethod
    def biomarker_lookup(biomarker_name: str, age: int = None, gender: str = "female", is_menstruating: bool = None) -> Dict[str, Any]:
        """
        Search for biomarker reference ranges and clinical information.
        
        Looks up normal ranges, units, and clinical significance for biomarkers
        that may not be in the reference database. Uses web search to find
        age-specific and gender-specific reference ranges.
        
        Args:
            biomarker_name: Name of the biomarker (e.g., "ferritin", "vitamin B12")
            age: Patient age for age-specific ranges (optional)
            gender: Patient gender for gender-specific ranges (default: "female")
            is_menstruating: Whether patient is menstruating (for iron-related markers)
            
        Returns:
            Dictionary with biomarker information including ranges, units, and clinical notes
        """
        try:
            # Build search query with context
            query_parts = [biomarker_name, "normal range", "reference range"]
            
            if age:
                if age < 50:
                    query_parts.append("premenopausal women" if gender == "female" else "men")
                else:
                    query_parts.append("postmenopausal women" if gender == "female" else "older men")
            elif gender:
                query_parts.append(f"{gender}s")
            
            if is_menstruating is not None:
                query_parts.append("menstruating" if is_menstruating else "non-menstruating")
            
            query_parts.extend(["clinical significance", "units"])
            query = " ".join(query_parts)
            
            # Use DuckDuckGo to search
            ddgs = DDGS()
            results = list(ddgs.text(query, max_results=5))
            
            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "title": result.get("title", ""),
                    "href": result.get("href", ""),
                    "body": result.get("body", "")
                })
            
            # Build summary
            summary = f"Biomarker lookup for '{biomarker_name}'\n"
            if age:
                summary += f"Age: {age} years, "
            summary += f"Gender: {gender}\n"
            if is_menstruating is not None:
                summary += f"Menstruating: {'yes' if is_menstruating else 'no'}\n"
            summary += "\nSearch Results:\n\n"
            
            for i, result in enumerate(formatted_results, 1):
                summary += f"{i}. {result['title']}\n   {result['body']}\n   {result['href']}\n\n"
            
            return {
                "biomarker": biomarker_name,
                "query": query,
                "summary": summary,
                "results": formatted_results,
                "count": len(formatted_results),
                "context": {
                    "age": age,
                    "gender": gender,
                    "is_menstruating": is_menstruating
                }
            }
            
        except Exception as e:
            return {
                "biomarker": biomarker_name,
                "query": query if 'query' in locals() else biomarker_name,
                "summary": f"Error looking up biomarker: {str(e)}",
                "results": [],
                "count": 0,
                "context": {
                    "age": age,
                    "gender": gender,
                    "is_menstruating": is_menstruating
                }
            }
    
    @staticmethod
    def web_search(query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Search the web using DuckDuckGo.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            
        Returns:
            Dictionary with search results including titles, URLs, and snippets
        """
        try:
            ddgs = DDGS()
            
            # Determine if query is time-sensitive
            time_sensitive_keywords = ["latest", "recent", "current", "today", "2024", "2025", "now"]
            is_time_sensitive = any(keyword in query.lower() for keyword in time_sensitive_keywords)
            
            if is_time_sensitive:
                results = list(ddgs.news(query, max_results=max_results))
            else:
                results = list(ddgs.text(query, max_results=max_results))
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "title": result.get("title", ""),
                    "href": result.get("href", ""),
                    "body": result.get("body", "")
                })
            
            summary = f"Web search results for '{query}':\n\n"
            for i, result in enumerate(formatted_results, 1):
                summary += f"{i}. {result['title']}\n   {result['body']}\n   {result['href']}\n\n"
            
            return {
                "query": query,
                "summary": summary,
                "results": formatted_results,
                "count": len(formatted_results)
            }
            
        except Exception as e:
            return {
                "query": query,
                "summary": f"Error performing search: {str(e)}",
                "results": [],
                "count": 0
            }
    
    @staticmethod
    def reddit_search(query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Search Reddit for relevant posts and top comments.
        
        Args:
            query: Search query string
            max_results: Maximum number of posts to return
            
        Returns:
            Dictionary with Reddit posts and their top comments
        """
        try:
            subreddits = ["health", "fitness", "nutrition", "longevity", "Biohackers"]
            all_posts = []
            
            headers = {"User-Agent": "Mozilla/5.0"}
            
            for subreddit in subreddits[:2]:  # Limit to 2 subreddits to avoid rate limits
                search_url = f"https://www.reddit.com/r/{subreddit}/search.json"
                params = {
                    "q": query,
                    "limit": max_results,
                    "sort": "relevance",
                    "restrict_sr": "on"
                }
                
                try:
                    response = requests.get(search_url, headers=headers, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        posts = data.get("data", {}).get("children", [])
                        
                        for post in posts[:max_results]:
                            post_data = post.get("data", {})
                            post_id = post_data.get("id")
                            
                            # Fetch top comments
                            comments = []
                            if post_id:
                                comments_url = f"https://www.reddit.com/r/{subreddit}/comments/{post_id}.json"
                                try:
                                    comments_response = requests.get(comments_url, headers=headers, timeout=10)
                                    if comments_response.status_code == 200:
                                        comments_data = comments_response.json()
                                        if len(comments_data) > 1:
                                            comment_list = comments_data[1].get("data", {}).get("children", [])
                                            for comment in comment_list[:3]:
                                                comment_body = comment.get("data", {}).get("body", "")
                                                if comment_body and comment_body != "[deleted]":
                                                    comments.append(comment_body)
                                except:
                                    pass
                            
                            all_posts.append({
                                "title": post_data.get("title", ""),
                                "selftext": post_data.get("selftext", "")[:500],
                                "url": f"https://reddit.com{post_data.get('permalink', '')}",
                                "score": post_data.get("score", 0),
                                "subreddit": subreddit,
                                "top_comments": comments
                            })
                except:
                    continue
            
            summary = f"Reddit search results for '{query}':\n\n"
            for i, post in enumerate(all_posts[:max_results], 1):
                summary += f"{i}. r/{post['subreddit']} - {post['title']}\n"
                summary += f"   Score: {post['score']}\n"
                summary += f"   {post['url']}\n"
                if post['top_comments']:
                    summary += f"   Top comments: {len(post['top_comments'])} found\n"
                summary += "\n"
            
            return {
                "query": query,
                "summary": summary,
                "posts": all_posts[:max_results],
                "count": len(all_posts[:max_results])
            }
            
        except Exception as e:
            return {
                "query": query,
                "summary": f"Error searching Reddit: {str(e)}",
                "posts": [],
                "count": 0
            }

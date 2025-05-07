import requests
import os

class Chatbot:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    def ask(self, question: str) -> str:
        """
        Send a question to the Gemini API and return the response.

        Args:
            question (str): The user's question.

        Returns:
            str: The chatbot's response.
        """
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [{
                "parts": [{"text": question}],
                "parts": [{"text": image_url} for image_url in self.get_image_urls(question)]
            }]
        }

        try:
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            # Extract the chatbot's response
            return data.get("contents", [{}])[0].get("parts", [{}])[0].get("text", "No response available.")
        except requests.exceptions.RequestException as e:
            print(f"Error communicating with the Gemini API: {e}")
            return "Sorry, I couldn't process your request at the moment."

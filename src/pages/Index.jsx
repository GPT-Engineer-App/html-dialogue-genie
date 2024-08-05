import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import OpenAI from "openai";
import { toast } from "sonner";

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [chatMode, setChatMode] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [editInput, setEditInput] = useState('');
  const [iframeContent, setIframeContent] = useState('<html><body><h1>Your app will appear here</h1></body></html>');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  const handleSendPrompt = async () => {
    const prompt = chatMode ? chatInput : editInput;
    
    if (apiKey) {
      // Use OpenAI API
      const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant that generates HTML content." },
            { role: "user", content: `Generate a simple HTML page based on this prompt: ${prompt}` }
          ],
        });

        const generatedHtml = response.choices[0].message.content;
        const parser = new DOMParser();
        const doc = parser.parseFromString(generatedHtml, 'text/html');
        const htmlContent = doc.documentElement.innerHTML;
        setIframeContent(htmlContent);
        toast.success("Content generated successfully");
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        toast.error("Error generating content. Please check your API key and try again.");
      }
    } else {
      // Use provided API endpoint
      try {
        const response = await fetch('https://jyltskwmiwqthebrpzxt.supabase.co/functions/v1/llm', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHRza3dtaXdxdGhlYnJwenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxNTA2NjIsImV4cCI6MjAzNzcyNjY2Mn0.a1y6NavG5JxoGJCNrAckAKMvUDaXAmd2Ny0vMvz-7Ng',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant that generates HTML content." },
              { role: "user", content: `Generate a simple HTML page based on this prompt: ${prompt}` }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("API Response:", data); // Log the entire response for debugging
        
        let generatedHtml = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
          generatedHtml = data.choices[0].message.content;
        } else if (typeof data === 'string') {
          generatedHtml = data;
        } else if (data.content) {
          generatedHtml = data.content;
        } else {
          console.error("Unexpected response format:", data);
          throw new Error('Unexpected response format');
        }

        // Ensure generatedHtml is a string
        generatedHtml = String(generatedHtml);

        // Ensure the generated HTML is wrapped in proper HTML tags
        if (!generatedHtml.trim().startsWith('<')) {
          generatedHtml = `<div>${generatedHtml}</div>`;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(generatedHtml, 'text/html');
        const htmlContent = doc.body.innerHTML;
        setIframeContent(htmlContent);
        toast.success("Content generated successfully");
      } catch (error) {
        console.error("Error processing API response:", error);
        toast.error(`Error: ${error.message}. Please try again.`);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 p-4 bg-white shadow-md">
        <Input
          type="password"
          placeholder="Enter OpenAI API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="mb-4"
        />
        <div className="flex mb-4">
          <Button
            onClick={() => setChatMode(true)}
            variant={chatMode ? "default" : "outline"}
            className="mr-2"
          >
            Chat
          </Button>
          <Button
            onClick={() => setChatMode(false)}
            variant={!chatMode ? "default" : "outline"}
          >
            Edit
          </Button>
        </div>
        {chatMode ? (
          <Textarea
            placeholder="Enter your chat message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="mb-4"
          />
        ) : (
          <Textarea
            placeholder="Enter your edit instructions"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            className="mb-4"
          />
        )}
        <Button onClick={handleSendPrompt} className="w-full">
          Send
        </Button>
      </div>
      <div className="w-2/3 p-4">
        <div className="flex justify-between mb-4">
          <Button variant="outline">Page select ▼</Button>
          <Button variant="outline">Visual Edit 🖌</Button>
        </div>
        <iframe
          srcDoc={`<html><body>${iframeContent}</body></html>`}
          title="App Preview"
          className="w-full h-[calc(100%-3rem)] border-2 border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default Index;

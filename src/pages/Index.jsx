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
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    const prompt = chatMode ? chatInput : editInput;
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
      setIframeContent(generatedHtml);
      toast.success("Content generated successfully");
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      toast.error("Error generating content. Please check your API key and try again.");
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
          srcDoc={iframeContent}
          title="App Preview"
          className="w-full h-[calc(100%-3rem)] border-2 border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default Index;

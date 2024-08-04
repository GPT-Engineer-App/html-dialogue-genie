import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    // TODO: Implement OpenAI API call
    const prompt = chatMode ? chatInput : editInput;
    console.log('Sending prompt:', prompt);
    // For now, just update the iframe with a placeholder
    setIframeContent(`<html><body><h1>Prompt sent: ${prompt}</h1></body></html>`);
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

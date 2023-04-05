import React, { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

const ChatGpt = (data: any) => {
  let formatedText = data?.lines.toString();
  console.log("data", formatedText);
  const [newQuestion, setNewQuestion] = useState("");

  const configuration = new Configuration({
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);

  const [storedValues, setStoredValues] = useState<any>([]);
  console.log("storedValues", storedValues);
  const generateResponse = async () => {
    let options = {
      model: "text-davinci-003",
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["/"],
    };

    let completeOptions = {
      ...options,
      prompt: `Narrate the following paragraph like ${newQuestion}    
       ${formatedText}`,
    };

    const response = await openai.createCompletion(completeOptions);

    if (response.data.choices) {
      setStoredValues([
        {
          question: newQuestion,
          answer: response.data.choices[0].text,
        },
        ...storedValues,
      ]);
      setNewQuestion("");
    }
  };

  return (
    <div className="form-section">
      <input
        className="form-control"
        placeholder="Enter any Auther name"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
      />
      <button className="btn" onClick={() => generateResponse()}>
        Format
      </button>

      <div className="answer-container">
        {storedValues.map((value: any, index: any) => {
          return (
            <div className="answer-section" key={index}>
              <p className="question">{value.question}</p>
              <p className="answer">{value.answer}</p>
              <div className="copy-icon">
                <i className="fa-solid fa-copy"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatGpt;

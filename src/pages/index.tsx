import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { Box, Grid, Card, TextField, Button, Typography } from "@mui/material";
import ChatGpt from "../components/chatGpt";
import people from "../assets/people.png";
import ai from "../assets/ai.png";
import Image from "next/image";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Loader from "../components/Loader";

export default function Home() {
  const [file, setFile] = useState("");
  const [transcription, setTranscription] = useState<any>("");
  const [lines, setLines] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [storedValues, setStoredValues] = useState<any>([]);
  const [gramLoader, setGramLoader] = useState(false);
  const [gptLoader, setGptLoader] = useState(false);
  let formatedText = lines.join("^").toString();

  const configuration = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_GPT_TOKEN,
  });

  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    setLines(transcription.split("."));
  }, [transcription]);
  const transcribe = async () => {
    setGramLoader(true);
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: JSON.stringify({
          url: file,
        }),
      });
      const received = await response.json();
      const data = JSON.parse(received);
      const transcription =
        data.results.channels[0].alternatives[0].paragraphs.transcript;
      setTranscription(transcription);
      setGramLoader(false);
    } catch (error) {
      setGramLoader(false);

      console.error(error);
    }
  };
  const generateResponse = async () => {
    setGptLoader(true);
    let options = {
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 1000,
      top_p: 0.1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      // stop: ["^"],
    };

    let completeOptions: any = {
      ...options,

      // prompt: `${newQuestion}
      //  ${formatedText}`,
      messages: [
        {
          role: "user",
          content: `${newQuestion}
        ${formatedText}`,
        },
      ],
    };
    let params = {
      first: newQuestion,
      second: formatedText,
    };
    const response = await axios.post(
      "https://dark-plum-caterpillar-ring.cyclic.app/transcribeGpt",
      {
        body: params,
      }
    );
    console.log("response", response);
    if (response.data) {
      setGptLoader(false);

      setStoredValues([
        {
          question: newQuestion,
          answer: response.data.content,
        },
      ]);
      setGptLoader(false);

      setNewQuestion("");
    }
  };

  return (
    <>
      <Head>
        <title>Audio Converter</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <form>
          <Box sx={{ p: 20, textAlign: "center" }}>
            <TextField
              id="Please Enter Audio Url"
              onChange={(e) => setFile(e.target.value)}
              label="Please Enter Audio Url"
              type="text"
              color="warning"
              size="small"
              error
              variant="outlined"
            />
            <Button
              variant="contained"
              type="button"
              sx={{ ml: -0.3, background: "#D32D15", height: "40px" }}
              color="warning"
              onClick={transcribe}
              className={styles.button}
            >
              Transcribe
            </Button>
          </Box>
        </form>

        <Card sx={{ height: "100vh", pb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 3 }}>
            <Typography variant="h5" sx={{ p: 2, fontWeight: "600" }}>
              Generated By DeepGram
            </Typography>
            <Box>
              <TextField
                id="Please Enter Audio Url"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                label="Please enter any auther name"
                type="text"
                color="warning"
                size="small"
                error
                variant="outlined"
              />
              <Button
                variant="contained"
                type="button"
                sx={{ ml: -0.3, background: "#D32D15", height: "40px" }}
                color="warning"
                onClick={() => generateResponse()}
                className={styles.button}
              >
                Transcribe
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ p: 3, mb: 3, overflow: "auto", height: "90vh" }}>
              {gramLoader ? (
                <Loader />
              ) : (
                <>
                  {lines.map((line, index) => {
                    if (line.startsWith("Speaker 0:")) {
                      return <p key={index}>{line}</p>;
                    } else {
                      return <p key={index}>{line}</p>;
                    }
                  })}
                </>
              )}
            </Box>

            <Box sx={{ p: 3, overflow: "auto", height: "50vh" }}>
              {gptLoader ? (
                <Loader />
              ) : (
                <>
                  {storedValues.map((value: any, index: any) => {
                    return (
                      <div className="answer-section" key={index}>
                        {/* <p className="question">{value.question}</p> */}
                        <p className="answer">{value.answer}</p>
                        <div className="copy-icon">
                          <i className="fa-solid fa-copy"></i>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </Box>
          </Box>
        </Card>
      </main>
    </>
  );
}

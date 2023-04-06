import { useState, useRef, useEffect } from "react";
import { Box, Typography, Grid, Card, Button, IconButton } from "@mui/material";
import {
  KeyboardVoice,
  Pause,
  PlayArrow,
  StopCircle,
  Download,
  Transcribe,
  CloudUpload,
} from "@mui/icons-material";
import axios from "axios";

const mimeType = "audio/x-m4a";
const AudioRecorder = ({ transcribeFuc }: any) => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<any>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [audioChunks, setAudioChunks] = useState<any[]>([]);
  const [pauseRecordingStatus, setPauseRecordingStatus] = useState("");
  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream: any = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    let options: any = {
      type: mimeType,
    };
    const media: any = new MediaRecorder(stream, options);

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks: any[] = [];

    mediaRecorder.current.ondataavailable = (event: any) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const pauseRecording = () => {
    setRecordingStatus("inactive");
    setPauseRecordingStatus("pause");
    mediaRecorder.current.pause();
  };

  const resumeRecording = () => {
    setRecordingStatus("active");
    setPauseRecordingStatus("resume");

    mediaRecorder.current.resume();
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);

      setAudio(audioUrl);

      setAudioChunks([]);
    };
  };

  useEffect(() => {
    (async () => {
      if (audio) {
        let recFile: any = await fetch(audio)
          .then((r) => r.blob())
          .then(
            (blobFile) =>
              new File([blobFile], "teststs", {
                type: mimeType,
              })
          );
        setAudioFile(recFile);
        console.log("file", recFile);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, [audio]);
  console.log("audio", audio);
  const handleFileChange = (file: any) => {
    console.log("file", file);
    setAudioFile(file[0]);
  };
  const handleUpload = async () => {
    let data: any = new FormData();
    data.append("audio", audioFile, audioFile?.name);
    let uploadedRes: any = await axios({
      method: "post",
      url: "https://dark-plum-caterpillar-ring.cyclic.app/audio/upload",
      data,
    })
      .then((response) => response)
      .catch((err) => err.response);
    if (uploadedRes.status === 200) {
      const { data } = uploadedRes;

      transcribeFuc(data?.secure_url);
    } else {
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box>
        <Typography
          variant="inherit"
          sx={{
            fontSize: "50px",
            fontWeight: "bold",
            mt: 5,
            textAlign: "center",
          }}
        >
          Otto - Biography
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",

            mt: 10,
          }}
        >
          {!permission ? (
            <Button
              variant="contained"
              color="warning"
              onClick={getMicrophonePermission}
              type="button"
            >
              Connect Microphone
            </Button>
          ) : null}
          {permission ? (
            <IconButton onClick={startRecording}>
              <KeyboardVoice
                sx={{
                  fontSize: "70px",
                  color: recordingStatus !== "inactive" ? "green" : "",
                }}
              />
            </IconButton>
          ) : null}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {permission ? (
            // <button onClick={stopRecording} type="button">
            //   Stop Recording
            // </button>
            <>
              <IconButton onClick={stopRecording}>
                <StopCircle
                  sx={{
                    fontSize: "20px",
                    color: recordingStatus !== "inactive" ? "red" : "",
                  }}
                />
              </IconButton>

              {recordingStatus === "inactive" ? (
                <IconButton onClick={resumeRecording}>
                  <PlayArrow
                    sx={{
                      fontSize: "20px",
                      color: recordingStatus !== "inactive" ? "green" : "",
                    }}
                  />
                </IconButton>
              ) : (
                <IconButton onClick={pauseRecording}>
                  <Pause
                    sx={{
                      fontSize: "20px",
                      color: recordingStatus !== "inactive" ? "green" : "",
                    }}
                  />
                </IconButton>
              )}
            </>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
            flexDirection: "column",
          }}
        >
          {/* <audio src={audio} controls></audio> */}
          {audio ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <audio src={audio} controls></audio>
            </Box>
          ) : null}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              mb: 3,
            }}
          >
            <Button variant="contained" color="warning" onClick={handleUpload}>
              <Transcribe sx={{ mr: 1 }} />
              Transcribe
            </Button>

            <Button variant="contained" color="warning">
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files)}
                style={{ width: "200px" }}
              />
              Upload Audio
              <CloudUpload sx={{ ml: 1, fontSize: "20px" }} />
            </Button>
          </Box>
          {audio ? (
            <Button variant="contained" color="success">
              <a
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
                download
                href={audio}
              >
                Download Recording <Download sx={{ ml: 2, fontSize: "20px" }} />
              </a>
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default AudioRecorder;

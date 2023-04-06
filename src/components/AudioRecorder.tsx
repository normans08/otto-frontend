import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
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
  const [recAudio, setRecAudio] = useState<any>(null);
  const [audioChunks, setAudioChunks] = useState<any[]>([]);
  const [pauseRecordingStatus, setPauseRecordingStatus] = useState("");
  const [loader, setLoader] = useState(false);
  const [upLoader, setUpLoader] = useState(false);
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
    if (permission) {
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
    }
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
    getMicrophonePermission();
  }, []);
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
        // setAudioFile(recFile);
        setRecAudio(recFile);
        console.log("file", recFile);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, [audio]);
  const handleFileChange = (file: any) => {
    setAudioFile(file[0]);
  };
  const handleUpload = async () => {
    setLoader(true);

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
      setLoader(false);
    } else {
      setLoader(false);
    }
  };
  const handleRecUpload = async () => {
    setUpLoader(true);

    let data: any = new FormData();
    data.append("audio", recAudio, recAudio?.name);
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
      setUpLoader(false);
    } else {
      setUpLoader(false);
    }
  };
  return (
    <>
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
          justifyContent: "space-between",
          pl: 25,
          gap: 2,
          pr: 25,
          mt: 7,
        }}
      >
        <Box
          sx={{
            p: 3,
            pl: 10,
            pr: 10,
            display: "flex",
            flexDirection: "column",
            background: "	#e6e6e6",
            border: "1px solid 	#D3D3D3",
            borderRadius: "20px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ textAlign: "center", fontSize: "30px", fontWeight: "600" }}
          >
            Record voice note
          </Typography>
          {/* {!permission ? (
            <Button
              variant="contained"
              color="warning"
              onClick={getMicrophonePermission}
              type="button"
            >
              Connect Microphone
            </Button>
          ) : null} */}

          <IconButton
            onClick={startRecording}
            disabled={loader ? true : false}
            sx={{
              alignItems: "center",
              // "&.css-1yqn7wg-MuiButtonBase-root-MuiIconButton-root": {
              //   background: "none !important",
              // },
              "& .css-1yqn7wg-MuiButtonBase-root-MuiIconButton-root": {
                background: "none !important",
              },
            }}
          >
            <KeyboardVoice
              sx={{
                fontSize: "70px",
                alignItems: "center",
                color: recordingStatus !== "inactive" ? "green" : "",
              }}
            />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {permission ? (
              // <button onClick={stopRecording} type="button">
              //   Stop Recording
              // </button>
              <>
                <Box>
                  <IconButton
                    onClick={stopRecording}
                    disabled={loader ? true : false}
                  >
                    <StopCircle
                      sx={{
                        fontSize: "25px",
                        color: recordingStatus !== "inactive" ? "red" : "",
                      }}
                    />
                  </IconButton>

                  {recordingStatus === "inactive" ? (
                    <IconButton
                      onClick={resumeRecording}
                      disabled={loader ? true : false}
                    >
                      <PlayArrow
                        sx={{
                          fontSize: "25px",
                          color: recordingStatus !== "inactive" ? "green" : "",
                        }}
                      />
                    </IconButton>
                  ) : (
                    <IconButton onClick={pauseRecording}>
                      <Pause
                        sx={{
                          fontSize: "25px",
                          color: recordingStatus !== "inactive" ? "green" : "",
                        }}
                      />
                    </IconButton>
                  )}
                </Box>
              </>
            ) : null}

            {audio ? <audio src={audio} controls></audio> : null}

            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2, borderRadius: "30px " }}
              disabled={loader ? true : false}
              onClick={handleRecUpload}
            >
              <Transcribe sx={{ mr: 1 }} />
              {upLoader ? (
                <CircularProgress size="20px" sx={{ ml: 3, color: "#fff" }} />
              ) : (
                <>Transcribe</>
              )}
            </Button>

            {audio ? (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2, borderRadius: "30px " }}
              >
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
                  Download Recording{" "}
                  <Download sx={{ ml: 2, fontSize: "20px" }} />
                </a>
              </Button>
            ) : null}
          </Box>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontSize: "30px", mt: 15 }}>
            OR
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            background: "	#e6e6e6",
            border: "1px solid 	#D3D3D3",
            borderRadius: "20px",
            p: 3,
            pl: 8,
            pr: 8,
          }}
        >
          <Typography
            variant="h4"
            sx={{ textAlign: "center", fontSize: "30px", fontWeight: "600" }}
          >
            Upload voice note
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 3, borderRadius: "30px " }}
          >
            <input
              type="file"
              disabled={upLoader ? true : false}
              onChange={(e) => handleFileChange(e.target.files)}
              style={{ width: "200px" }}
            />
          </Button>

          <Button
            sx={{
              mt: 3,
              borderRadius: "30px ",
            }}
            disabled={upLoader ? true : false}
            variant="contained"
            color="success"
            onClick={handleUpload}
          >
            <Transcribe sx={{ mr: 1 }} />
            {loader ? (
              <CircularProgress size="20px" sx={{ ml: 3, color: "#fff" }} />
            ) : (
              <>Transcribe</>
            )}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default AudioRecorder;

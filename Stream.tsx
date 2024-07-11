import axios from "axios";
import React, {
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Icon } from "@iconify/react";
import screenfull from "screenfull";
import HorizontalTimeline from "../../../../components/Timeline";

interface StreamProps {
  index: number;
  cameraId: string | number;
  url: string;
  port: number;
  cameraCount: number;
  takeSS: boolean;
  session: string;
  activeStreamIndex: number;
  singleFulscreen: boolean;
  nodeId: string;
  deleteData: object;
  setTakeSS: (e: any) => void;
  setActiveStreamIndex: (e: any) => void;
  setSingleFulscreen: (e: any) => void;
}

const Stream: FC<StreamProps> = ({
  cameraId,
  url,
  port,
  cameraCount,
  session,
  index,
  takeSS,
  nodeId,
  deleteData,
  singleFulscreen,
  setTakeSS,
  setActiveStreamIndex,
  activeStreamIndex,
  setSingleFulscreen,
}) => {
  const streamRef = useRef(null);
  // const [count, setCount] = useState(true);
  const [timelineData, setTimelineData] = useState();
  var h: number;
  var w: number;

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const imgData = event.data;
      const imgSrc = `data:image/jpeg;base64, ${imgData}`;

      if (streamRef.current) {
        //@ts-ignore
        streamRef.current.src = imgSrc;
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }, []);

  useEffect(() => {
    const websocket = new WebSocket(`ws://127.0.0.1:${port}`);
    websocket.onmessage = handleWebSocketMessage;
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.close();
    };
  }, [handleWebSocketMessage, port]);

  const captureScreenshotHandler = () => {
    //@ts-ignore
    sendImageToDatabase(streamRef.current.src);
    setTakeSS(false);
  };

  useEffect(() => {
    if (takeSS) captureScreenshotHandler();
  }, [takeSS]);

  // console.log(cameraCount);
  useEffect(() => {
    const dimensionsMap: { [key: number]: { w: number; h: number } } = {
      1: { w: 800, h: 400 },
      2: { w: 600, h: 300 },
      3: { w: 500, h: 250 },
      4: { w: 400, h: 200 },
      5: { w: 200, h: 100 },
    };
    
    const dimensions = dimensionsMap[cameraCount] || { w: 150, h: 75 };
  
    const data = {
      rtsp_url: url,
      port: port,
      session_id: session,
      camera_id: cameraId,
      to_save: 0,
    };
  
    const dataOne = {
      rtsp_url: url,
      port: port + 1,
      session_id: session,
      camera_id: cameraId,
      to_save: 1,
    };
  
    const startPromises = [
      axios.post("http://127.0.0.1:5001/start", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      }),
      axios.post("http://127.0.0.1:5001/start", dataOne, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      }),
    ];
  
    const saveStreamPromise = axios.post(
      "http://127.0.0.1:5001/save_stream",
      {
        port: port + 1,
        camera_id: cameraId,
        session_id: session,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      }
    );
  
    axios
      .post("http://127.0.0.1:5001/change_stream", dimensions, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {
        try {
          const [startResponse, saveStreamResponse] = await Promise.all([
            Promise.all(startPromises),
            saveStreamPromise,
          ]);
          // Handle responses
        } catch (error) {
          console.log("err");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [cameraCount, cameraId, port, session, url]);

  const sendImageToDatabase = async (imageFile: string) => {
    try {
      const formData = new FormData();
      formData.append("nodeId", nodeId);
      formData.append("image", imageFile);
  
      const response = await fetch("/api/captureScreenshots", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        console.log("Image successfully sent to the database.");
      } else {
        console.error("Failed to send image to the database.");
      }
    } catch (error) {
      console.error("Error sending image to the database:", error);
    }
  };
  
  if (screenfull?.isEnabled) {
    screenfull.on("change", () => {
      console.log("Am I fullscreen?", screenfull.isFullscreen ? "Yes" : "No");
  
      if (!screenfull.isFullscreen) {
        setSingleFulscreen(false);
      }
    });
  }
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  useEffect(() => {
    if (singleFulscreen) {
      const fetchData = async () => {
        try {
          const res = await axios.get(`/api/session/${session}/node/${nodeId}/camera/${cameraId}/events`);
          setTimelineData(res.data);
        } catch (error) {
          console.log(error);
        }
      };
  
      fetchData();
    }
  }, [singleFulscreen]);

  return (
    <div className="h-full flex  items-center justify-center w-full max-h-[100%] relative">
      <img
        className="video-stream"
        id={`video-stream${index}`}
        ref={streamRef}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          height: "100%",
          width: "auto",
        }}
      />

      <div
        className={
          activeStreamIndex === index
            ? "flex justify-center items-center gap-4 self-end mt-auto absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-gradient-to-bl from-[rgba(217,217,217,.2)] to-[rgba(217,217,217,.1)] border border-solid border-[#d3d3d3]"
            : "hidden  justify-center items-center gap-4 self-end mt-auto absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-gradient-to-bl from-[rgba(217,217,217,.2)] to-[rgba(217,217,217,.1)] border border-solid border-[#d3d3d3]"
        }
      >
        <span
          className="rounded bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center"
          onClick={(event) => {
            if (!singleFulscreen) {
              if (screenfull.isEnabled) {
                setSingleFulscreen(true);
                event.stopPropagation();
                const screen = document.getElementById(`screen-${index}`);
                axios
                  .post(`"http://127.0.0.1:5001/full_screen`, deleteData, {
                    headers,
                  })
                  .then((response) => {
                    console.log("Entered Full-Screen:", response.data);
                  })
                  .catch((error) => {
                    console.error("Error entering Full-Screen:", error);
                  });
                //@ts-ignore
                screenfull.request(screen);
              }
            } else {
              setSingleFulscreen(false);
              axios
                .post(`"http://127.0.0.1:5001/exit_full_screen`, deleteData, {
                  headers,
                })
                .then((response) => {
                  console.log("Entered Full-Screen:", response.data);
                })
                .catch((error) => {
                  console.error("Error entering Full-Screen:", error);
                });
              screenfull.exit();
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M14.061 0.307617V4.97933H12.5037V2.96271L9.94209 5.53215L8.83645 4.42651L11.4059 1.86486H9.38927V0.307617H14.061ZM0.0458374 0.307617V4.97933H1.60308V2.96271L4.16473 5.53215L5.27037 4.42651L2.70093 1.86486H4.71755V0.307617H0.0458374ZM14.061 14.3228V9.65105H12.5037V11.6677L9.94209 9.10602L8.84424 10.2039L11.4059 12.7655H9.38927V14.3228H14.061ZM4.71755 14.3228V12.7655H2.70093L5.26259 10.2039L4.16473 9.09823L1.60308 11.6677V9.65105H0.0458374V14.3228H4.71755Z"
              fill="white"
            />
          </svg>
        </span>
        <span className="rounded bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white">
          <Icon icon="mdi:record-rec" height={24} width={24} />
        </span>
        <span
          onClick={(event) => {
            const src = captureSingle(index);
            if (src !== null) sendImageToDatabase(src);
            event.stopPropagation();
          }}
          className="rounded bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white"
        >
          <Icon icon="iconoir:screenshot" height={24} width={24} />
        </span>
        <span className="rounded bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M8 2.75v10.5a.751.751 0 0 1-1.238.57L3.473 11H1.75A1.75 1.75 0 0 1 0 9.25v-2.5C0 5.784.784 5 1.75 5h1.722l3.29-2.82A.75.75 0 0 1 8 2.75Zm3.28 2.47L13 6.94l1.72-1.72a.751.751 0 0 1 1.042.018a.751.751 0 0 1 .018 1.042L14.06 8l1.72 1.72a.749.749 0 0 1-.326 1.275a.749.749 0 0 1-.734-.215L13 9.06l-1.72 1.72a.749.749 0 0 1-1.275-.326a.749.749 0 0 1 .215-.734L11.94 8l-1.72-1.72a.749.749 0 0 1 .326-1.275a.749.749 0 0 1 .734.215Zm-7.042 1.1a.752.752 0 0 1-.488.18h-2a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h2c.179 0 .352.064.488.18L6.5 11.62V4.38Z"
            />
          </svg>
        </span>
      </div>
      {singleFulscreen && timelineData && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 scale-[.7] w-full flex items-center justify-center">
          <HorizontalTimeline events={timelineData} />
        </div>
      )}
    </div>
  );
};

export default Stream;

export const captureSingle = (index) => {
  console.log(index);
  if (index !== null) {
    var img = document.getElementById(`video-stream${index}`);

    if (img) {
      var src = img.getAttribute("src");
      return src;
    }
  }
};

// const { w, h } = useMemo(() => {
//   console.log("in dimension memo");
//   let w: number, h: number;
//   if (cameraCount === 1) {
//     w = 800;
//     h = 400;
//   } else if (cameraCount === 2) {
//     w = 600;
//     h = 300;
//   } else if (cameraCount === 3) {
//     w = 500;
//     h = 250;
//   } else if (cameraCount === 4) {
//     w = 400;
//     h = 200;
//   } else if (cameraCount === 5) {
//     w = 200;
//     h = 100;
//   } else if (cameraCount >= 6) {
//     w = 150;
//     h = 75;
//   }

//   return { w, h };
// }, [cameraCount]);

// const data = useMemo(
//   () => ({
//     rtsp_url: url,
//     port: port,
//     session_id: session,
//     camera_id: cameraId,
//     to_save: 0,
//   }),
//   [url, port, session, cameraId]
// );

// const dataOne = useMemo(
//   () => ({
//     rtsp_url: url,
//     port: port + 1,
//     session_id: session,
//     camera_id: cameraId,
//     to_save: 1,
//   }),
//   [url, port, session, cameraId]
// );

// useEffect(() => {
//   const dimensions = { h: h, w: w };

//   axios
//     .post("http://127.0.0.1:5001/change_stream", dimensions, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//     .then((response) => {
//       axios
//         .post("http://127.0.0.1:5001/start", data, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 3000,
//           // signal: abortSignal,
//         })
//         .then((response) => {
//           console.log(response, "stream already started");
//         })
//         .catch((error) => {
//           if (axios.isCancel(error)) {
//             // Request was canceled
//             console.log("Request was canceled");
//           } else {
//             console.error("Error:", error);
//           }
//         });

//       //save
//       axios
//         .post("http://127.0.0.1:5001/start", dataOne, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 3000,
//         })
//         .then((response) => {
//           console.log(response, "stream already started");
//         })
//         .catch((error) => {});

//       setTimeout(() => {
//         axios
//           .post(
//             "http://127.0.0.1:5001/save_stream",
//             {
//               port: port + 1,
//               camera_id: cameraId,
//               session_id: session,
//             },
//             {
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               timeout: 3000,
//             }
//           )
//           .then((res) => {
//             console.log(res);
//           })
//           .catch((error) => {
//             console.log("[SAVE_STREAM_ERROR]", error);
//           });
//       }, 1500);

//       setTimeout(() => {
//         setActiveStreamIndex(index);
//         // abortController.abort();
//       }, 3000);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }, []);

// const { w, h } = useMemo(() => {
//   console.log("in dimension memo");
//   let w, h;
//   if (cameraCount === 1) {
//     w = 800;
//     h = 400;
//   } else if (cameraCount === 2) {
//     w = 600;
//     h = 300;
//   } else if (cameraCount === 3) {
//     w = 500;
//     h = 250;
//   } else if (cameraCount === 4) {
//     w = 400;
//     h = 200;
//   } else if (cameraCount === 5) {
//     w = 200;
//     h = 100;
//   } else if (cameraCount >= 6) {
//     w = 150;
//     h = 75;
//   }
//   return { w, h };
// }, [cameraCount]);

// const data = useMemo(
//   () => ({
//     rtsp_url: url,
//     port: port,
//     session_id: session,
//     camera_id: cameraId,
//     to_save: 0,
//   }),
//   [url, port, session, cameraId]
// );

// const dataOne = useMemo(
//   () => ({
//     rtsp_url: url,
//     port: port + 1,
//     session_id: session,
//     camera_id: cameraId,
//     to_save: 1,
//   }),
//   [url, port, session, cameraId]
// );

// const handleEffect = useCallback(() => {
//   const dimensions = { h: h, w: w };

//   axios
//     .post("http://127.0.0.1:5001/change_stream", dimensions, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//     .then((response) => {
//       axios
//         .post("http://127.0.0.1:5001/start", data, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 3000,
//           // signal: abortSignal,
//         })
//         .then((response) => {
//           console.log(response, "stream already started");
//         })
//         .catch((error) => {
//           if (axios.isCancel(error)) {
//             // Request was canceled
//             console.log("Request was canceled");
//           } else {
//             console.error("Error:", error);
//           }
//         });

//       //save
//       axios
//         .post("http://127.0.0.1:5001/start", dataOne, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 3000,
//         })
//         .then((response) => {
//           console.log(response, "stream already started");
//         })
//         .catch((error) => {});

//       setTimeout(() => {
//         axios
//           .post(
//             "http://127.0.0.1:5001/save_stream",
//             {
//               port: port + 1,
//               camera_id: cameraId,
//               session_id: session,
//             },
//             {
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               timeout: 3000,
//             }
//           )
//           .then((res) => {
//             console.log(res);
//           })
//           .catch((error) => {
//             console.log("[SAVE_STREAM_ERROR]", error);
//           });
//       }, 1500);

//       setTimeout(() => {
//         setActiveStreamIndex(index);
//         // abortController.abort();
//       }, 3000);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }, []);

// useEffect(handleEffect, [handleEffect]);



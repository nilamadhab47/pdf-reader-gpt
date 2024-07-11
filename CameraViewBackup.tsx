//@ts-nocheck
"use client";

import useSessionStore from "@/app/store/useSessionStore";
import Stream from "./Stream";
import { Icon } from "@iconify/react";
import { Camera, Node, Session } from "@prisma/client";
import React from "react";
import { FC, useRef, useState, useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Vector from "@/public/images/plusLight.png";
import Vector_dark from "@/public/images/plusDark.png";
import axios from "axios";
import { useParams } from "next/navigation";
import AlertsPanel from "@/components/AlertsPanel";
import Image from "next/image";
import useCameraModalStore from "@/app/store/useCameraModal";
import screenfull from "screenfull";
import { captureSingle } from "./Stream";
import DynamicAlertPanelWithProps from "../../../../components/dynamic/DynamicAlertPanel";

interface CameraViewBackupProps {
  session: Session & { nodes: Node[]; camera: Camera[] };
}

const CameraViewBackup: FC<CameraViewBackupProps> = ({ session }) => {
  const selectedNode = useSessionStore((s) => s.selectedNode);
  const [tempelate, setTempelate] = useState("1fr");
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeStreamIndex, setActiveStreamIndex] = useState(null);
  const [recordDropdownOpen, setRecordDropdownOpen] = useState(false);
  const [snipDropDownOpen, setSnipDropDownOpen] = useState(false);
  const [allFullScreen, setAllFullScreen] = useState(false);
  const [singleFulscreen, setSingleFulscreen] = useState(false);
  const [takeSS, setTakeSS] = useState(false);
  const captureRef = useRef(null);
  const singleRef = useRef(null);
  const cameraModal = useCameraModalStore();
  const smolHandle = useFullScreenHandle();
  const handleAllFullscreenChange = (isFullscreen: boolean) => {
    setAllFullScreen(isFullscreen);
  };

  const handleStreamClick = (index: any) => {
    if (activeStreamIndex !== index) {
      setActiveStreamIndex(index);
    } else {
      setActiveStreamIndex(null);
    }
  };

  const cameraCount = session.camera.length;
  const numColumns = Math.ceil(cameraCount / Math.ceil(Math.sqrt(cameraCount)));
  useEffect(() => {
    if (cameraCount === 1) {
      setTempelate("1fr");
    }
    if (cameraCount > numColumns) {
      setTempelate(`repeat(${Math.ceil(Math.sqrt(cameraCount))},1fr)`);
    }
  }, [cameraCount]);

  const [data, setData] = useState();
  const [updateData, setUpdateData] = useState();

  useEffect(() => {
    if (!data) {
      getData();
    }
    if (updateData) {
      getData();
    }
  }, [updateData]);

  const params = useParams();

  const getData = async () => {
    try {
      if (!selectedNode || !selectedNode.id) {
        return;
      }
      const response = await axios.get(
        `/api/session/${params?.sessionId}/node/${selectedNode.id}/events`
      );

      if (response.status === 200) {
        setData(response.data);
        setUpdateData(null);
      } else {
        console.error("Request failed with status:", response.status);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const sendImageToDatabase = async (imageFile) => {
    try {
      const formData = new FormData();
      // console.log(nodeId)
      formData.append("image", imageFile);
      formData.append("nodeId", session.nodes[0].id);

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

  return (
    <div className="right h-screen flex-1 bg-white dark:bg-[#1b1b1b] overflow-x-clip">
      <div
        className={
          "bg-white dark:bg-[#1b1b1b] w-full flex flex-row items-center justify-end  dark:border-[#292929] py-4 px-6 border-b-[1px] border-solid border-[#d9d9d9]"
        }
      >
        <div className="flex items-center justify-center text-[#4F4F4F] gap-6 dark:text-white">
          <span
            className="flex items-center justify-center gap-2 cursor-pointer relative "
            onClick={() => {
              setRecordDropdownOpen(!recordDropdownOpen);
              setSnipDropDownOpen(false);
            }}
          >
            <Icon icon="fontisto:radio-btn-active" height={22} width={22} />
            Screen record
            {recordDropdownOpen && (
              <div
                id="dropdown"
                className="z-40 flex bg-white divide-y divide-gray-100 rounded-lg shadow-dropdown w-40  absolute top-8 left-2 items-center justify-center"
              >
                <ul
                  className="py-2 text-sm text-black"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li className="w-full">
                    <button
                      className="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                      disabled
                    >
                      Current View
                    </button>
                  </li>
                  <li className="w-full">
                    <button
                      className="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                      disabled
                    >
                      Selected Screen
                    </button>
                  </li>
                  <li className="w-full">
                    <button
                      className="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                      disabled
                    >
                      All Screens
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </span>
          <span className="w-[1px] bg-[#e0e0e0] h-[24px]" />
          <span
            className="flex items-center justify-center gap-2 cursor-pointer relative"
            onClick={() => {
              setSnipDropDownOpen(!snipDropDownOpen);
              setRecordDropdownOpen(false);
            }}
          >
            <Icon icon="iconoir:screenshot" height={24} width={24} />
            Screen snip
            {snipDropDownOpen && (
              <div
                id="dropdown"
                className="z-40 flex items-center justify-center bg-white divide-y divide-gray-100 shadow-dropdown text-black rounded-lg shadow w-40 absolute top-8 left-2"
              >
                <ul
                  className="py-2 text-sm "
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li className="w-full">
                    <button
                      className=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full"
                      onClick={() => {
                        setTakeSS(true);
                      }}
                    >
                      Current View
                    </button>
                  </li>
                  <li className="w-full">
                    <button
                      className=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full"
                      onClick={() => {
                        if (activeStreamIndex === null) {
                          alert("no selected screen");
                        } else {
                          console.log(activeStreamIndex);
                          const src = captureSingle(activeStreamIndex);
                          if (src) sendImageToDatabase(src);
                        }
                      }}
                    >
                      Selected Screen
                    </button>
                  </li>
                  <li className="w-full">
                    <button
                      onClick={() => {
                        setTakeSS(true);
                      }}
                      className=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full"
                    >
                      All Screens
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </span>
          <span className="w-[1px] bg-[#e0e0e0] h-[24px]" />
          <span
            className="flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Icon icon="mingcute:alert-line" width={24} height={24} />
            Alerts
          </span>
          <span className="w-[1px] bg-[#e0e0e0] h-[24px]" />
          <span
            className="flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => {
              if (cameraCount > 0) {
                smolHandle.enter();
              }
            }}
          >
            <Icon icon="gridicons:fullscreen" height={24} width={24} />
            Fullscreen
          </span>
        </div>
      </div>
      <div className="w-full flex items-start justify-between h-[calc(100vh-137px)] ">
        <FullScreen
          handle={smolHandle}
          onChange={handleAllFullscreenChange}
          className={
            allFullScreen
              ? "w-full h-screen flex items-center justify-center"
              : "w-full h-full flex items-start"
          }
        >
          <div
            ref={captureRef}
            className={
              cameraCount > 0
                ? "image-grid place-items-center dark:bg-[#1b1b1b] bg-[#1b1b1b] w-full h-full"
                : "image-grid place-items-center bg-[#fff] dark:bg-[#1b1b1b] w-full h-full"
            }
            style={{
              gridTemplateColumns: tempelate,
            }}
          >
            {cameraCount !== 0 ? (
              <>
                {Array.from({ length: cameraCount }).map((_, index) => {
                  const deleteData = {
                    rtsp_url: session.camera[index].url,
                    port: session.camera[index].port,
                  };
                  return (
                    <React.Fragment key={index}>
                      <div
                        id={`screen-${index}`}
                        className={
                          activeStreamIndex === index
                            ? "w-full h-full  relative border-[#2952e1] border-2 border-solid "
                            : "w-full h-full  relative hover:border-[#2952e1]  hover:border-2 hover:border-solid border-[#1b1b1b] border "
                        }
                      >
                        <div
                          onClick={() => handleStreamClick(index)}
                          className="flex items-center justify-center h-full w-full "
                          ref={singleRef}
                        >
                          <Stream
                            index={index}
                            cameraId={session.camera[index].id}
                            nodeId={session.nodes[0].id}
                            url={session.camera[index].url}
                            port={session.camera[index].port}
                            cameraCount={cameraCount}
                            takeSS={takeSS}
                            session={params.sessionId}
                            activeStreamIndex={activeStreamIndex}
                            singleFulscreen={singleFulscreen}
                            deleteData={deleteData}
                            setTakeSS={setTakeSS}
                            setActiveStreamIndex={setActiveStreamIndex}
                            setSingleFulscreen={setSingleFulscreen}
                          />
                        </div>

                        <span className="flex gap-1 bg-[rgba(255,255,255,.68)] py-1 px-3 absolute bottom-4 left-4 items-center rounded-xl scale-[.95]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M0.8125 4.7501C0.8125 2.38923 2.72663 0.475098 5.0875 0.475098C7.44837 0.475098 9.3625 2.38923 9.3625 4.7501C9.3625 7.11097 7.44837 9.0251 5.0875 9.0251C2.7277 9.02225 0.81535 7.1099 0.8125 4.75045V4.7501ZM1.6675 4.7501C1.6675 6.63894 3.19866 8.1701 5.0875 8.1701C6.97634 8.1701 8.5075 6.63894 8.5075 4.7501C8.5075 2.86126 6.97634 1.3301 5.0875 1.3301C3.19973 1.33224 1.66964 2.86233 1.6675 4.74974V4.7501ZM3.0925 4.7501C3.0925 4.22099 3.30269 3.71355 3.67682 3.33942C4.05096 2.96528 4.55839 2.7551 5.0875 2.7551C5.61661 2.7551 6.12404 2.96528 6.49818 3.33942C6.87231 3.71355 7.0825 4.22099 7.0825 4.7501C7.0825 5.2792 6.87231 5.78664 6.49818 6.16078C6.12404 6.53491 5.61661 6.7451 5.0875 6.7451C4.55839 6.7451 4.05096 6.53491 3.67682 6.16078C3.30269 5.78664 3.0925 5.2792 3.0925 4.7501Z"
                              fill="#C20D02"
                            />
                          </svg>
                          <span className="text-xs text-[#C20D02] font-extrabold">
                            {session.camera[index].name} - Rec
                          </span>
                        </span>
                        <span
                          onClick={() => {
                            if (!singleFulscreen) {
                              if (screenfull.isEnabled) {
                                setSingleFulscreen(true);
                                const element = document.getElementById(
                                  `screen-${index}`
                                );
                                axios
                                  .post(
                                    `http://127.0.0.1:5001/full_screen`,
                                    deleteData,
                                    {
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                    }
                                  )
                                  .then((response) => {
                                    console.log(
                                      "Entered Full-Screen:",
                                      response.data
                                    );
                                  })
                                  .catch((error) => {
                                    console.log(
                                      "Error entering Full-Screen:",
                                      error
                                    );
                                  });

                                screenfull.request(element);
                              }
                            } else {
                              setSingleFulscreen(false);
                              axios
                                .post(
                                  `http://127.0.0.1:5001/exit_full_screen`,
                                  deleteData,
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                  }
                                )
                                .then((response) => {
                                  console.log(
                                    "Entered Full-Screen:",
                                    response.data
                                  );
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error entering Full-Screen:",
                                    error
                                  );
                                });
                              screenfull.exit();
                            }
                          }}
                          className={
                            activeStreamIndex !== index
                              ? "absolute p-1 top-4 right-4 cursor-pointer bg-[rgba(0,0,0,.5)] rounded "
                              : "absolute p-1 top-4 right-4 cursor-pointer bg-[rgba(0,0,0,.5)] rounded hidden"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M18 0V6H16V3.41L12.71 6.71L11.29 5.29L14.59 2H12V0H18ZM0 0V6H2V3.41L5.29 6.71L6.71 5.29L3.41 2H6V0H0ZM18 18V12H16V14.59L12.71 11.3L11.3 12.71L14.59 16H12V18H18ZM6 18V16H3.41L6.7 12.71L5.29 11.29L2 14.59V12H0V18H6Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                <Image
                  src={Vector}
                  alt="whitevector"
                  className="w-[300px] h-auto mb-4 dark:hidden flex cursor-pointer"
                  onClick={() => cameraModal.onOpen()}
                />
                <Image
                  src={Vector_dark}
                  alt="darkvector"
                  className="w-[300px] h-auto mb-4 hidden dark:flex cursor-pointer"
                  onClick={() => cameraModal.onOpen()}
                />
              </>
            )}
          </div>

          {allFullScreen && (
            <div
              className="text-white capitalize absolute top-2 right-2 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                smolHandle.exit();
                setAllFullScreen(false);
              }}
            >
              {" "}
              minimize screen{" "}
              <Icon icon="teenyicons:minimise-solid" height={24} width={24} />
            </div>
          )}
        </FullScreen>
        <div className={showAlerts ? "show-alerts" : "hide-alerts"}>
          {showAlerts && (
            <DynamicAlertPanelWithProps selectedNode={selectedNode} />
          )}
        </div>{" "}
      </div>
    </div>
  );
};

export default CameraViewBackup;

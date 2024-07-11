// @ts-nocheck
"use client";
import { Session } from "@prisma/client";
import { FC, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import useSessionStore from "@/app/store/useSessionStore";
import useCameraModalStore from "@/app/store/useCameraModal";
import CameraInfoTooltip from "@/components/tooltips/CameraInfoTooltip";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface NodeViewProps {
  session: Session & { nodes: Node[] };
}

const NodeView: FC<NodeViewProps> = ({ session }) => {
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [active, setActive] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchInputRef = useRef();
  const cameraModal = useCameraModalStore();
  const selectedNode = useSessionStore((s: any) => s.selectedNode);
  const setSelectedNode = useSessionStore((s: any) => s.setSelectedNode);
  const filteredCameras = selectedCameras
    .filter((value) =>
      value.name.toLowerCase().startsWith(searchInput.toLowerCase())
    )
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));

  const handleNodeSelect = (event: string) => {
    const selectedOption = event.target.value;
    if (selectedOption === "Add a new Node +") {
    } else {
      setSelectedNode(
        session.nodes.filter((node) => node.nodeName === selectedOption)
      );
      setSearchInput("");
    }
  };

  // console.log(session);

  useEffect(() => {
    if (session.camera.length > 0) {
      setSelectedCameras(session.camera);
    }
  }, [session]);

  return (
    <div
      className={`left flex flex-col parent  border-solid border-[#d9d9d9] 
      dark:border-[#292929]  border-r-[1px] dark:bg-[#1b1b1b] bg-white h-screen`}
    >
      <div className="relative">
        <select
          className="bg-white dark:bg-[#1b1b1b] py-4 mt-1 font-semibold px-4 w-[300px] outline-none capitalize text-[#015A62] dark;
          dark:text-white select border-b-[1px] border-solid border-[#d9d9d9] max-h-[53px]  dark:border-[#292929]"
          name="nodeSelecter"
          onChange={handleNodeSelect}
          value={selectedNode.nodeName}
        >
          <option>Add a new Node +</option>
          {session.nodes.map((option) => (
            <option key={option.id}>{option.nodeName}</option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon
            icon="mingcute:down-line"
            className="text-[#015a62] dark:text-white"
            height={24}
            width={24}
          />
        </span>
      </div>

      {selectedCameras.length === 0 ? (
        <div className="flex flex-col items-start px-4 pt-4 dark:bg-[#1b1b1b] bg-white">
          <button
            onClick={() => cameraModal.onOpen()}
            className="text-black dark:text-white dark:bg-[#1b1b1b] bg-white"
          >
            Add Camera +
          </button>
        </div>
      ) : (
        <>
          <div className="relative flex items-center px-4 py-4 gap-5  dark:bg-[#1b1b1b] bg-white">
            <Icon
              icon="tabler:search"
              className="absolute dark:text-white text-black top-1/2 -translate-y-1/2 left-6"
              height={22}
              width={22}
            />
            <input
              id="search-input"
              type="text"
              className="bg-transparent border border-gray-300 dark:border-[#333] text-gray-900 capitalize text-sm sm:text-[10px] md:text-xs lg:text-sm xl:text-md rounded-lg block  py-2.5 pl-10  box-border dark:focus:border-black dark:active:border-black w-[225px]"
              placeholder="Search camera"
              onChange={(e) => setSearchInput(e.target.value)}
              ref={searchInputRef}
            />
            {searchInput.trim() !== "" && (
              <Icon
                icon="octicon:x-16"
                className="text-black dark:text-white absolute top-1/2 -translate-y-1/2 right-[70px] cursor-pointer hover:text-rose-700"
                height={22}
                width={22}
                onClick={() => {
                  setSearchInput("");
                  searchInputRef.current.value = "";
                }}
              />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              onClick={() => cameraModal.onOpen()}
              className="cursor-pointer"
            >
              <path
                d="M12 1.5C9.22562 1.53347 6.57431 2.65047 4.61239 4.61239C2.65047 6.57431 1.53347 9.22562 1.5 12C1.53347 14.7744 2.65047 17.4257 4.61239 19.3876C6.57431 21.3495 9.22562 22.4665 12 22.5C14.7744 22.4665 17.4257 21.3495 19.3876 19.3876C21.3495 17.4257 22.4665 14.7744 22.5 12C22.4665 9.22562 21.3495 6.57431 19.3876 4.61239C17.4257 2.65047 14.7744 1.53347 12 1.5ZM18 12.75H12.75V18H11.25V12.75H6V11.25H11.25V6H12.75V11.25H18V12.75Z"
                fill="#015A62"
              />
            </svg>
          </div>
          <div className="overflow-y-scroll overflow-x-clip h-[calc(100vh-260px)] py-2">
            {filteredCameras !== null && filteredCameras.length > 0 ? (
              filteredCameras?.map((value, index) => (
                <CameraInfoTooltip
                  key={index}
                  name={value.name}
                  port={value.port}
                  url={value.url}
                  active={active === value.id}
                  onClick={() => {
                    setActive(active === value.id ? null : value.id);
                  }}
                  onRename={(newName) => {
                    const oldName = value.name;
                    axios
                      .patch(
                        `/api/session/${session.id}/node/${selectedNode.id}/camera/${value.id}`,
                        {
                          name: newName,
                          url: value.url,
                          port: value.port,
                        }
                      )
                      .then((response) => {
                        router.refresh();
                        toast({
                          title: `Camera ${oldName} renamed to ${newName}`,
                        });
                      });
                  }}
                  onDelete={() => {
                    console.log(value.id);
                    axios
                      .delete(
                        `/api/session/${session.id}/node/${selectedNode.id}/camera/${value.id}`
                      )
                      .then((response) => {
                        if (response && filteredCameras.length === 1)
                          // router.replace("/");
                          router.refresh();
                        toast({
                          title: `Camera ${value.name} deleted`,
                          variant: "destructive",
                        });
                      });
                    const data = {
                      rtsp_url: value.url,
                      port: value.port,
                    };
                    // const data1 = {
                    //   rtsp_url: value.url,
                    //   port: value.port + 1,
                    // };
                    console.log("!!");
                    axios
                      .post("http://127.0.0.1:5001/stop", data, {
                        headers: {
                          "Content-Type": "application/json",
                        },
                      })
                      .then((response) => {
                        console.log("Success:", response.data);
                        router.refresh();
                      })
                      .catch((error) => {
                        console.error("Error:", error);
                      });

                    // axios
                    //   .post("http://127.0.0.1:5001/stop", data1, {
                    //     headers: {
                    //       "Content-Type": "application/json",
                    //     },
                    //   })
                    //   .then((response) => {
                    //     console.log("Success:", response.data);
                    //     router.refresh();
                    //   })
                    //   .catch((error) => {
                    //     console.error("Error:", error);
                    //   });
                  }}
                />
              ))
            ) : (
              <div className="text-black px-4 text-sm flex flex-row items-center gap-1">
                No cameras found with that name.
              </div>
            )}
          </div>
        </>
      )}

      <div className="absolute bottom-0 border-t border-accent">
        <select
          className="py-4 font-semibold px-4 w-[300px] outline-none capitalize dark:bg-[#1b1b1b] bg-white text-[rgba(0,0,0,.7)] select min-h-[57px]  text-black dark:text-white"
          name="nodeSelecter"
        >
          <option>Change Screen layout</option>
          <option>manage existing node</option>
          <option>manage existing camera</option>
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon
            icon="mingcute:up-fill"
            className="text-black dark:text-white"
            height={22}
            width={22}
          />
        </span>
      </div>
    </div>
  );
};

export default NodeView;

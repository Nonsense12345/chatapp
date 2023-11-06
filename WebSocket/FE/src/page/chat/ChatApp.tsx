// import axios from "axios";
import React, { useEffect, useState } from "react";
import logo from "../../assets/img/logo.png";
import useWebSocket from "react-use-websocket";
import style from "./style.module.scss";
import Login from "./Login";

import { toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";

interface validateDataMess {
  mesid: string;
  message: string;
  time: string;
  uid: string;
  username: string;
  photo?: string;
  File?: {
    mime_type: string;
    file_name: string;
    link: string;
    data: string;
  };
}

const ChatApp = () => {
  //const [dataFiles, setDataFiles] = useState<FileData>();
  const [messages, setMessages] = useState<validateDataMess[]>([]);
  const [isLogined, setIsLogined] = useState<boolean>(false);
  const [inputMessages, setInputMessages] = useState<string>("");
  const [UserName, setUserName] = useState<string>("");
  const [file, setFile] = useState<File>();

  const [photoImg, setPhotoImg] = useState<string>("");
  useEffect(() => {
    console.log("Messages state changed:", messages);
  }, [messages]);

  const { sendMessage } = useWebSocket("ws://localhost:8080/ws", {
    onMessage: (e) => {
      const res = JSON.parse(e.data);
      console.log(res);

      if (res.type !== "USER_JOIN") {
        if (res.type === "USER_LEAVE") {
          toast.warn(res.user.UserName + " Leaved");
        }
        setMessages((prevMessages) => [...prevMessages, res.message]);
      } else if (res.type === "USER_JOIN" && isLogined) {
        toast.success(res.user.UserName + " joined");
      }
    },
  });
  function renderContentByMimeType(item: validateDataMess) {
    if (!item.File) return null;

    const { mime_type, link } = item.File;
    console.log(mime_type);

    console.log(mime_type);
    const src = "http://localhost:8080" + link || "";

    if (mime_type.includes("image")) {
      return <img src={src} alt="" width={500} height={500} />;
    } else if (mime_type.includes("audio")) {
      return (
        <audio controls src={src}>
          Your browser does not support the audio element.
        </audio>
      );
    } else if (mime_type.includes("video")) {
      return (
        <video controls src={src}>
          Your browser does not support the video element.
        </video>
      );
    } else if (mime_type.includes("text")) {
      return <iframe src={src} title="text-content" />;
    } else if (mime_type.trim() === "") {
      return "";
    } else {
      return (
        <p className="bg-slate-800 rounded-lg p-2 cursor-pointer">
          <span
            onClick={(e) => {
              e.preventDefault();
              window.open(src, "_blank");
            }}
          >
            {mime_type.split("/")[1]}
          </span>
        </p>
      );
    }
  }

  const sendMessaged = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "user",
        JSON.stringify({
          user: {
            Photo:
              photoImg ||
              "https://i1.sndcdn.com/artworks-000312487053-e5am72-t500x500.jpg",
            UserName: UserName,
          },
        })
      );
      formData.append(
        "message",
        JSON.stringify({
          photo: photoImg,
          username: UserName,
          message: inputMessages,
        })
      );
      fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text())
        .then((result) => {
          console.log("Success:", result);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      const avar =
        photoImg.trim() !== ""
          ? photoImg
          : "https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg";
      sendMessage(
        JSON.stringify({
          type: "ADD_MESSAGE",
          user: {
            username: UserName,
            photo: avar,
          },
          message: {
            username: UserName,
            message: inputMessages,
            time: new Date(),
          },
        })
      );
    }
  };
  const getData = async () => {
    if (isLogined) {
      const res = await axios.get("http://localhost:8080/allmessages");
      console.log(res);

      if (res.data) {
        const totalMess: validateDataMess[] = [];
        Object.keys(res.data).forEach(function (key) {
          totalMess.push(res.data[key]);
        });

        setMessages(totalMess);
      }
    }
  };

  const login = (username: string, img: string) => {
    setIsLogined(true);
    setUserName(username);
    setPhotoImg(img);

    sendMessage(
      JSON.stringify({
        type: "USER_JOIN",
        user: {
          username: username,
          photo: img,
        },
      })
    );
  };
  document.documentElement.style.overflow = "hidden";
  useEffect(() => {
    const element = document.getElementById("scrollbar");
    if (element) {
      element.style.overflowX = "hidden"; // Ẩn thanh cuộn ngang
    }
    getData();
  }, [isLogined]);
  useEffect(() => {
    const Box = document.getElementById("scrollbar");
    if (Box) {
      const scrollDistance = Box.scrollHeight - Box.offsetHeight;
      Box.scrollTo(0, scrollDistance);
    }
  }, [messages]);
  const handleFileChange = () => {
    const inputFile = document.querySelector("#files") as HTMLInputElement;
    if (inputFile && inputFile.files) {
      setFile(inputFile.files[0]);
    }
  };

  return (
    <div>
      {!isLogined ? (
        <Login login={login} />
      ) : (
        <div className={`${style.login} block h-screen overflow-hidden`}>
          <div className="h-[200px] flex justify-center items-center">
            <div className="flex items-center w-[300px] justify-between">
              <img src={logo} alt="logo" className="h-[100px]" />
              <h1 className="text-[3em]">Chat App</h1>
            </div>
          </div>
          <div className="w-full flex justify-center h-[480px] 2xl:h-[600px]  ">
            <div
              className={`w-4/5  rounded-lg shadow-[0px_0px_50px_-20px_rgba(0,0,0,0.8)] border-separate `}
            >
              <div className="h-[90%] overflow-auto" id="scrollbar">
                {messages &&
                  messages.map((item: validateDataMess) => (
                    <div key={item.time}>
                      {item.username === UserName ? (
                        <div className="flex items-start justify-end  my-[10px]">
                          <div className="flex items-center justify-end">
                            <span className="mx-[20px] opacity-50 text-[14px]">
                              {dayjs(item.time).format("hh:mm - DD/MM/YYYY")}
                            </span>
                            <span className="max-w-[200px] sm:max-w-[600px] xl:max-w-[800px] bg-[#3d91ff] break-words rounded-2xl px-[14px] py-[6px] ">
                              <p className="text-[12px] opacity-90 text-right">
                                {item.username}
                              </p>
                              <p className="">{item.message}</p>
                              {item.File && renderContentByMimeType(item)}
                            </span>
                          </div>
                          <div className="mx-[10px] ">
                            <img
                              src={
                                photoImg ||
                                "https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                              }
                              alt="logo"
                              className="h-[30px] rounded-full w-[30px] object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start   my-[10px]">
                          <div className="mx-[10px] ">
                            <img
                              src={
                                item.photo ||
                                "https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                              }
                              alt="logo"
                              className="h-[30px] rounded-full w-[30px] object-cover"
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="max-w-[200px] sm:max-w-[600px] xl:max-w-[800px] bg-red-300 break-words rounded-2xl px-[14px] py-[6px]">
                              <p className="text-[12px] opacity-90 text-left">
                                {item.username}
                              </p>
                              <p className="">{item.message}</p>
                              {item.File && renderContentByMimeType(item)}
                            </span>
                            <span className="mx-[20px] opacity-50 text-[14px]">
                              {dayjs(item.time).format("hh:mm - DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div className=" flex items-center h-[10%] border-t-[1px] border-[#f9f9f9] w-[100%] ">
                <div className="flex w-full  items-center bg-white  mx-[20px] p-[10px]  rounded-xl h-[40px] 2xl:h-[50px]">
                  {file?.name ? (
                    <div className="bg-red-400 h-[30px] rounded-2xl  px-[10px] py-[2px] flex">
                      <span className="line-clamp-1">{file?.name}</span>
                      <i
                        className="bi bi-x text-white text-[20px] cursor-pointer"
                        onClick={() => setFile(undefined)}
                      ></i>
                    </div>
                  ) : (
                    ""
                  )}

                  <input
                    value={inputMessages}
                    placeholder="Messages ..."
                    onChange={(e) => {
                      setInputMessages(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setInputMessages("");
                        sendMessaged();
                      }
                    }}
                    className="w-4/5  rounded-l-full  text-black outline-none pl-[10px]"
                  />

                  <div className="flex w-auto xl:w-[20%] justify-end">
                    <div className=" rounded-full  flex justify-center items-center">
                      <label htmlFor="files" className="text-black">
                        <i className="bg-[#3d91ff] hover:opacity-80 flex justify-center items-center w-[30px] h-[30px] rounded-full bi bi-plus  text-white text-[26px]"></i>
                      </label>
                      <input
                        id="files"
                        type="file"
                        onChange={handleFileChange}
                        className={` z-[-1] absolute opacity-0`}
                      />
                    </div>
                    <div
                      className={`flex items-center border-[2px] border-solid border-[#3d91ff]  rounded-full w-[60px] justify-center ml-[10px] hover:opacity-90 overflow-hidden ${style.send}`}
                      onClick={() => {
                        if (inputMessages.trim() !== "" || file) {
                          setInputMessages("");
                          sendMessaged();
                        }
                      }}
                    >
                      <div className="flex flex-col">
                        <i
                          className={`bi bi-send text-[14px] img1 text-[#3d91ff]  ${style.imgSend}`}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;

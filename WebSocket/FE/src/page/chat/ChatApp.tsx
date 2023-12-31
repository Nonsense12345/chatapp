// import axios from "axios";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/img/logo.png";
import useWebSocket from "react-use-websocket";
import style from "./style.module.scss";
import "./styles.css";
import Login from "./Login";
// import cat from "../../assets/img/cat.jpg";
// import angry from "../../assets/img/angry.jpg";
// import cry from "../../assets/img/Cry.jpg";
// import cry2 from "../../assets/img/cry2.png";
// import dam from "../../assets/img/dam.jpg";
// import dog from "../../assets/img/dog.png";
// import dog2 from "../../assets/img/dog2.jpg";
// import fuck from "../../assets/img/fuck.jpg";
// import game from "../../assets/img/game.png";
// import like from "../../assets/img/like.png";
// import namo from "../../assets/img/namo.jpg";
// import sad from "../../assets/img/sad.jpg";
// import shoot from "../../assets/img/shoot.png";
// import smart from "../../assets/img/smart.jpg";
// import haha from "../../assets/img/haha.jpg";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import "./styles.css";

import { Navigation } from "swiper/modules";
import VoiceRoom from "./VoiceRoom";
interface ReadResult {
  done: boolean;
  value?: Uint8Array;
}

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
interface typeUser {
  CreateAt: string;
  Id: string;
  message: validateDataMess[];
  Photo: string;
  RemoteAddr: string;
  UserName: string;
}
const ChatApp = () => {
  // const listMeme = useRef<string[]>([
  //   cat,
  //   angry,
  //   cry,
  //   cry2,
  //   haha,
  //   dam,
  //   dog,
  //   dog2,
  //   fuck,
  //   game,
  //   namo,
  //   like,
  //   shoot,
  //   smart,
  //   sad,
  // ]);
  const listIcon = useRef<string[]>([
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "😍",
    "🥰",
    "😎",
    "🥳",
    "😊",
    "😭",
    "😢",
    "😡",
    "🤬",
    "😰",
    "😨",
    "😱",
    "🤮",
    "🤢",
    "🤤",
    "💩",
    "🫶",
    "👊",
    "🤛",
    "💋",
    "👀",
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
  ]);
  const [done, setDone] = useState(true);
  const [messages, setMessages] = useState<validateDataMess[]>([]);
  const [isLogined, setIsLogined] = useState<boolean>(false);
  const [inputMessages, setInputMessages] = useState<string>("");
  const [UserName, setUserName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [file, setFile] = useState<File>();
  const [listUserOnline, setListUserOnline] = useState<typeUser[]>([]);
  const [photoImg, setPhotoImg] = useState<string>("");
  const itemFirst = useRef<HTMLDivElement>(null);
  const itemLast = useRef<HTMLDivElement>(null);
  document.body.style.overflowX = "hidden";
  useEffect(() => {
    setTimeout(() => {
      itemFirst.current?.classList.remove(
        ..."translate-x-[200px] opacity-0".split(" ")
      );
      itemLast.current?.classList.remove(
        ..."translate-x-[-200px] opacity-0".split(" ")
      );
    }, 500);
  });
  useEffect(() => {
    console.log("Messages state changed:", messages);
  }, [messages]);

  const { sendMessage } = useWebSocket("wss://chat.catim.pp.ua/ws", {
    onMessage: (e) => {
      const res = JSON.parse(e.data);

      if (res.type !== "USER_JOIN") {
        if (res.type === "USER_LEAVE") {
          console.log("OLD : " + JSON.stringify(listUserOnline));
          const NewListUsersOnline = listUserOnline.filter(
            (item) => item.Id != res.user.Id
          );
          console.log("New :" + JSON.stringify(NewListUsersOnline));
          console.log(res.user.Id);
          setListUserOnline(NewListUsersOnline);
          toast.warn(res.user.UserName + " Leaved");
        }

        setMessages((prevMessages) => [...prevMessages, res.message]);
      } else if (res.type === "USER_JOIN" && isLogined) {
        setListUserOnline((prevList) => [...prevList, res.user]);
        toast.success(res.user.UserName + " joined");
      }
    },
    onOpen: () => {
      toast.success("Connected");
    },
    onClose: () => {
      toast.error("Can Not Connect to server");
    },
  });
  function renderContentByMimeType(item: validateDataMess) {
    if (!item.File) return null;

    const { mime_type, link } = item.File;

    const src = "https://chat.catim.pp.ua" + link || "";

    if (mime_type.includes("image")) {
      return (
        <img
          src={src}
          alt="img"
          className="object-cover"
          width={300}
          height={300}
        />
      );
    } else if (mime_type.includes("audio")) {
      return (
        <audio controls src={src}>
          Your browser does not support the audio element.
        </audio>
      );
    } else if (mime_type.includes("video")) {
      return (
        <video controls src={src} width={280} height={280}>
          Your browser does not support the video element.
        </video>
      );
    } else if (mime_type.includes("text")) {
      return (
        <iframe
          src={src}
          title="text-content"
          height={300}
          className="w-[100px] sm:w-[180px] md:w-[250px] xl:w-[300px]"
        />
      );
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
      setTotalSize(file.size);

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

      const controller = new AbortController();
      fetch("https://chat.catim.pp.ua/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
        .then((response) => response.text())
        .then((result) => {
          console.log("Success:", result);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      setDone(false);
      const reader = file.stream().getReader();
      const progress = ({ done, value }: ReadResult) => {
        if (done) setDone(true);
        if (value) {
          setUploadProgress((oldProgress) => {
            const newProgress = oldProgress + value.length;

            return newProgress;
          });
        }
        if (!done) {
          reader.read().then(progress as (result: ReadResult) => void);
        }
      };
      reader.read().then(progress);
    } else {
      const avar =
        photoImg.trim() !== ""
          ? photoImg
          : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
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
      try {
        const allUser = await axios.get("https://chat.catim.pp.ua/allusers");

        if (allUser.data) {
          const totalUserOnlie: typeUser[] = [];
          Object.keys(allUser.data).forEach(function (key) {
            totalUserOnlie.push(allUser.data[key]);
          });
          setListUserOnline(totalUserOnlie);
        }
      } catch (err) {
        console.log(err);
      }
      try {
        const res = await axios.get("https://chat.catim.pp.ua/allmessages");
        if (res.data) {
          const totalMess: validateDataMess[] = [];
          Object.keys(res.data).forEach(function (key) {
            totalMess.push(res.data[key]);
          });

          setMessages(totalMess);
        }
      } catch (err) {
        console.log(err);
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
  const width = useRef<HTMLDivElement>(null);
  const showIcon = useRef<HTMLDivElement>(null);
  const [bottom, setBottom] = useState<number>();
  document.documentElement.style.overflowX = "hidden";
  useEffect(() => {
    const element = document.getElementById("scrollbar");
    if (element) {
      element.style.overflowX = "hidden"; // Ẩn thanh cuộn ngang
    }
    getData();
    setBottom(width.current?.offsetHeight);
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
  const onShowIcon = () => {
    showIcon.current?.classList.toggle("opacity-0");
    showIcon.current?.classList.toggle("pointer-events-none");
  };
  const onOffIcon = () => {
    showIcon.current?.classList.add(
      ..."opacity-0 pointer-events-none".split(" ")
    );
  };

  return (
    <div className="h-screen ">
      {!isLogined ? (
        <Login login={login} />
      ) : (
        <div
          className={`${style.login} block h-full overflow-auto  py-[10px] overflow-x-hidden`}
          onClick={(e) => {
            onOffIcon();
            e.stopPropagation();
          }}
        >
          <div
            ref={itemFirst}
            className="flex justify-around flex-wrap lg:justify-center items-center relative flex-col translate-x-[200px] opacity-0   ease-in-out duration-[2s]"
          >
            <div className="flex items-center w-[300px] justify-center">
              <img
                src={logo}
                alt="logo"
                className="h-[40px] lg:h-[80px] mt-[20px]"
              />
              <h1 className="text-[1.5em] md:text-[2em] ">Chat App</h1>
            </div>
            <div className="lg:absolute top-[20px] right-[50px] flex items-center">
              <div className="mr-[10px] border-[2px] border-solid border-[#3d91ff] rounded-xl">
                <img
                  src={photoImg}
                  alt="logo"
                  className="h-[60px] w-[60px] rounded-xl object-cover"
                />
              </div>
              <div
                onClick={() => setIsLogined(false)}
                className="text-[#f3e5fe] hover:text-white transition-all duration-200 ease-in-out cursor-pointer"
              >
                <div>{UserName}</div>
                <div>Đăng Xuất</div>
              </div>
            </div>
            <div className="text-[1.2em] my-[10px] md:my-[4px]">
              Thành Viên Online
            </div>
            <div className="h-[60px] w-4/5 shadow-[0px_0px_50px_-20px_rgba(0,0,0,0.8)] rounded-full flex justify-center items-center">
              {listUserOnline && listUserOnline.length > 0 ? (
                <Swiper
                  slidesPerView={1}
                  navigation={true}
                  slidesPerGroup={1}
                  speed={600}
                  modules={[Navigation]}
                  className="mySwiper  text-white "
                  breakpoints={{
                    576: {
                      slidesPerView: 2,
                      slidesPerGroup: 1,
                    },
                    768: {
                      slidesPerView: 3,
                      slidesPerGroup: 2,
                    },
                    1024: {
                      slidesPerView: 4,
                      slidesPerGroup: 3,
                    },
                    2048: {
                      slidesPerView: 5,
                      slidesPerGroup: 3,
                    },
                  }}
                >
                  {listUserOnline &&
                    listUserOnline.map((item) => (
                      <SwiperSlide className="flex items-center " key={item.Id}>
                        <div className="w-[40px] h-[40px] relative">
                          <img
                            src={item.Photo}
                            alt=""
                            className="rounded-2xl"
                          />
                          <div className="h-[10px] w-[10px] absolute bg-[#35cc3c] bottom-[0]  right-0 rounded-full"></div>
                        </div>
                        <p className="break-words w-[40%] line-clamp-1">
                          {item.UserName}
                        </p>
                      </SwiperSlide>
                    ))}
                </Swiper>
              ) : (
                <div className="text-[1em]">
                  Không có người dùng nào đang hoạt động
                </div>
              )}
            </div>
            <div>
              <VoiceRoom UserName={UserName} Photo={photoImg} />
            </div>
          </div>
          <div
            ref={itemLast}
            className="w-full mt-[10px]  md:mt-[20px] flex justify-center h-[70vh] flex-col items-center translate-x-[-200px] opacity-0  ease-in-out duration-[2s]"
          >
            <div
              className={`w-4/5  rounded-lg shadow-[0px_0px_50px_-20px_rgba(0,0,0,0.8)] border-separate h-full overflow-hidden `}
            >
              <div className="h-[80%] overflow-auto" id="scrollbar">
                {messages &&
                  messages.map((item: validateDataMess, index) => (
                    <div key={item.time + index}>
                      {item.username === UserName ? (
                        <div className="flex items-start justify-end  my-[6px]">
                          <div className="flex items-center justify-end">
                            <span className="mx-[20px] opacity-50 text-[14px]">
                              {dayjs(item.time).format("hh:mm - DD/MM/YYYY")}
                            </span>
                            <span className="overflow-auto max-w-[200px] sm:max-w-[600px] xl:max-w-[800px] bg-[#3d91ff] break-words rounded-2xl px-[14px] py-[6px] ">
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
                                "https://qph.cf2.quoracdn.net/main-qimg-965b11ec95106e64d37f5c380802c305-lq"
                              }
                              alt="logo"
                              className="h-[30px] rounded-full w-[30px] object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start   my-[6px]">
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
                            <span className="max-w-[200px] sm:max-w-[600px] xl:max-w-[800px] overflow-auto bg-red-300 break-words rounded-2xl px-[14px] py-[6px]">
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
              <div>
                {!done && (
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                      style={{
                        width: `${(uploadProgress / totalSize) * 100}%`,
                      }}
                    >
                      {uploadProgress}/{totalSize}
                    </div>
                  </div>
                )}
              </div>
              <div className=" flex items-center h-[15%]   py-[10px]   w-[100%] ">
                {/* icon */}

                <div
                  ref={width}
                  className="flex w-full   lg:flex-row flex-col relative  items-center  bg-white  mx-[20px] p-[10px] h-auto rounded-xl"
                >
                  <div
                    ref={showIcon}
                    className={`absolute flex overflow-auto justify-center md:justify-start opacity-0 pointer-events-none transition-all duration-200 ease-in-out  flex-wrap lg:w-[300px]  bg-white p-[10px] right-[10px] rounded-sm h-[200px]  w-[100px] sm:w-[150px]`}
                    style={bottom ? { bottom: `${bottom + 18}px` } : {}}
                  >
                    {listIcon.current.map((item) => (
                      <div
                        key={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInputMessages(inputMessages + item);
                        }}
                        className="select-none h-[40px] w-[40px] flex justify-center mx-[6px] rounded-xl object-cover cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {file?.name ? (
                    <div className="bg-red-400 h-[30px] rounded-2xl lg:flex hidden  px-[10px] py-[2px] max-w-[100px] ">
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
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        setInputMessages("");
                        sendMessaged();
                        setFile(undefined);
                      }
                    }}
                    className="w-4/5    text-black outline-none pl-[10px] resize-none "
                  />

                  <div className="flex w-auto xl:w-[20%] justify-end flex-col">
                    {file?.name ? (
                      <div className="bg-red-400 h-[30px] rounded-2xl lg:hidden flex  px-[10px] py-[2px] mb-[10px] ">
                        <span className="line-clamp-1">{file?.name}</span>
                        <i
                          className="bi bi-x text-white text-[20px] cursor-pointer"
                          onClick={() => setFile(undefined)}
                        ></i>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="flex justify-center lg:justify-end">
                      <div className=" rounded-full  flex justify-center items-center ">
                        <label htmlFor="files" className="text-black">
                          <i className="bg-[#3d91ff] cursor-pointer hover:opacity-80 flex justify-center items-center w-[30px] h-[30px] rounded-full bi bi-plus  text-white text-[26px]"></i>
                        </label>
                        <input
                          id="files"
                          type="file"
                          onChange={handleFileChange}
                          className={` z-[-1] absolute opacity-0`}
                        />
                      </div>
                      <div
                        className=" mx-[20px] "
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowIcon();
                        }}
                      >
                        <i className="bi bi-emoji-laughing text-[26px] cursor-pointer hover:opacity-80 rounded-full text-[#3d91ff]"></i>
                      </div>
                      <div
                        className={`flex items-center border-[2px] border-solid border-[#3d91ff]  rounded-full w-[60px] justify-center  hover:opacity-90 overflow-hidden ${style.send}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inputMessages.trim() !== "" || file) {
                            setInputMessages("");
                            sendMessaged();
                            setFile(undefined);
                          }
                        }}
                      >
                        <div className="flex cursor-pointer">
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
        </div>
      )}
    </div>
  );
};

export default ChatApp;

import { useEffect, useRef, useState } from "react";
import style from "./style.module.scss";
import logo from "../../assets/img/logo.png";
const imgDefault =
  "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
interface PropLogin {
  login: (text: string, text2: string) => void;
}
const Login: React.FC<PropLogin> = ({ login }) => {
  const [img, setImg] = useState(imgDefault);
  const [name, setName] = useState("");
  const itemLogo = useRef<HTMLDivElement>(null);
  const itemLogin = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      itemLogo.current?.classList.remove(
        ..."translate-x-[500px] opacity-0".split(" ")
      );
      itemLogin.current?.classList.remove(
        ..."translate-x-[-500px] opacity-0".split(" ")
      );
    }, 1000);
  });
  useEffect(() => {});
  return (
    <div
      className={`${style.login} flex flex-col md:flex-row items-center justify-around`}
    >
      <div
        ref={itemLogo}
        className={`flex items-center justify-center translate-x-[500px] opacity-0 transition-all ease-in-out duration-[2s]`}
      >
        <img
          src={logo}
          alt="logo"
          className="h-[40px] md:h-[80px] lg:h-[120px] mt-[20px]"
        />

        <h2 className="font-semibold text-[2em] md:text-[3em] lg:text-[4em]">
          Chat App
        </h2>
      </div>
      <div
        ref={itemLogin}
        className={`${style.box} translate-x-[-500px] opacity-0 transition-all ease-in-out duration-[2s]`}
      >
        <form>
          <h1 className="font-semibold text-[2em]">User</h1>
          <div className={style.inputBox}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "enter") {
                  login(name, img);
                }
              }}
              type="text"
              required
              maxLength={20}
            />
            <span>User Name</span>
            <i className={style.i}></i>
          </div>

          <div className={style.inputBox}>
            <input
              value={img}
              onChange={(e) => setImg(e.target.value)}
              type="text"
              placeholder="defaut avatar"
            />
            <span>Url: (img avatar default) </span>
            <i className={style.i}></i>
          </div>
          <button
            className={`${style.loginButon} text-black text-[1em] tracking-wider relative overflow-hidden rounded-lg`}
            onClick={() => {
              if (name.trim() != "") {
                login(name, img);
              }
            }}
          >
            <div
              className={`absolute  z-[100] opacity-90 ${style.overlay} `}
            ></div>
            <h1 className={style.txt}>Login</h1>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

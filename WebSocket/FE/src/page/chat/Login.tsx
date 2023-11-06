import { useState } from "react";
import style from "./style.module.scss";
const imgDefault =
  "https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg";
interface PropLogin {
  login: (text: string, text2: string) => void;
}
const Login: React.FC<PropLogin> = ({ login }) => {
  //   const dispatch = useDispatch();
  //   const navigate = useNavigate();
  const [img, setImg] = useState(imgDefault);
  const [name, setName] = useState("");
  //   let [pass, setPass] = useState("");
  //   const handleLogin = () => {
  //     if (name && pass) {
  //       dispatch(logIned({ img, name }));
  //       navigate("/");
  //     }
  //   };
  return (
    <div className={style.login}>
      <div className={style.login_avar}>
        <h2 className="font-semibold text-[2em]">Chat App</h2>
      </div>
      <div className={style.box}>
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

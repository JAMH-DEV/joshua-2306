import { useState } from 'react'
//components
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
//images
import background from '../assets/images/background.png'
import logo from '../assets/images/logo.png'
import imgLogin from '../assets/images/imgLogin.png'
import imgRegister from '../assets/images/imgRegister.png'



function Auth() {
  const [isRegistering, setIsRegistering] = useState(false)
  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Capa oscura + contenedor principal */}
      <div className="h-screen bg-black/30 flex">

        {/* Mitad izquierda */}
        <div className="w-1/2 h-full flex flex-col">
          <div className="h-2/3  flex flex-col items-end justify-start pr-50 ">
            <img
                src={logo}
                alt="Snail Casino"
                className="w-80 mr-10 "
            />
            <img src={isRegistering ? imgRegister : imgLogin} 
                 className="w-110 ml-3 mt-10">
            </img>
          </div>
        </div>
        {/* Mitad izquierda - End */}

        {/* Mitad derecha */}
        <div className="w-1/2 h-full flex flex-col">

          {/* Derecha arriba */}
          <div className="h-full justify-center items-center flex">
           {/*Login*/ }
           <div className="h-5/6 w-4/6 bg-black/80 rounded-2xl 
           flex flex-col justify-center items-center gap-2 p-7 border border-white/40">
            {isRegistering ? (
                <RegisterForm
                    onLogin={() => setIsRegistering(false)}
                />
                ) : (
                <LoginForm
                    onRegister={() => setIsRegistering(true)}
                />
            )}
           </div>
           {/*Login*- End*/ }
          </div>
        </div>
        {/* Mitad derecha - End */}
      </div>
    </main>
  )
}

export default Auth

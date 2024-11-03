import React, { useState, useEffect } from 'react';
import style from './login.module.css';
import ModalOneButton from '../../utils/common_components/ModalOneButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { ES_text } from '../../utils/text_scripts';
import { handleResponse, sendVerification } from '../../utils/async_functions';
import { checkUser, getBusinessesNumber, loginUser, registerUser } from '../../utils/db_functions';
import { jwtDecode } from 'jwt-decode';
import userStore from '../../utils/store';
import { MoonLoader } from 'react-spinners';
import LargeScreenNotice from '../../utils/common_components/LargeScreenNotice';
import { passwordRegex, emailRegex, phoneRegex } from '../../utils/common_functions';
import CustomGoogleLoginBtn from '../../utils/common_components/CustomGoogleLoginBtn';


const Login = ({language}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id'); // Get 'id' from query params
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [business, setBusiness] = useState({
                                            codRazSoc:null,
                                            businessName: null
                                          });
  const [businessLoading, setBusinessLoading] = useState(true);
  const [email, setEmail] = useState('')
  const [password,  setPassword] = useState('')
  const [newAccountMode, setNewAccountMode] = useState(false)
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isGoogleLogin, setIsGoogleLogin] = useState(false)




  // Zustand store for login status
  const setLoginStatus = userStore((state) => state.setLoginStatus);

  // Fetch business number based on id
  useEffect(() => {
  const fetchBusinessNumber = async () => {
    if (id) {
      try {
        const result = await getBusinessesNumber(id);
        
        setBusiness(prevState => ({
          ...prevState,
          codRazSoc: result[0].EM_cod_raz_soc,
          businessName: result[0].EM_nom_fant
        }));


        console.log(result)
      } catch (error) {
        console.error("Error fetching business number:", error);
      } finally {
        setBusinessLoading(false); // Mark business loading as complete
      }
    } else {
      setBusinessLoading(false); // No id, still set loading to false
    }
  };

  fetchBusinessNumber();
}, [id]);


  // Handle Google login response
  const handleLogin = async () => {
    setLoginLoading(true);

    try {
      const { exists, userId, valid, emailVerified, token } = await loginUser(email, password);

      if(!valid){
        alert('Invalid credentials')
        return
      }

      if(exists && valid && !emailVerified){
        alert('Please verify your email address')
        return
      }
      if (exists && emailVerified && valid) {
        setNewUser(false);
        setLoginStatus(true, userId);
        if(business.codRazSoc){
          navigateToMenuIfId()
        } else {
          navigate('/')
        }; // Navigate to the menu if there's an ID after login
      } else {
        setNewUser(true);
        setOpenModal(true);
        setData(token); // Save response for later registration
      }
    } catch (e) {
      console.error('Error checking user:', e);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password === repeatPassword && passwordRegex.test(password) && emailRegex.test(email)) {
      setOpenModal(true);
  
      if (phone !== '' && phoneRegex.test(phone)) {
        try {
          const response = await registerUser(email, password, phone, false);

  
          if (response.success) {
            setNewUser(false);
            setLoginStatus(true, response.userId);
            sendVerification(email, response.userId)
  
            // Navigate immediately after successful registration
            if (business.codRazSoc) {
              navigateToMenuIfId();
            } else {
              navigate('/');
            }
          }
        } catch (e) {
          console.error('Error registering user:', e);
        }
      } 
    } else {
      alert('Invalid input');
    }
  };

  const handleGoogleLoginRegister  = async (email) => {
    try {
      const userExists = await checkUser(email)
      if (userExists) {
        setNewUser(false)
        console.log(userExists)
        setLoginStatus(true, userExists.userId)
        console.log(userExists)
        if (business.codRazSoc) {
          navigateToMenuIfId();
        } else {
          console.log('here')
          navigate('/');
        } 
      }  else {
        setOpenModal(true);
        if (phone !== '' && phoneRegex.test(phone)){
          const response = await registerUser(email, null, phone, true)
          if (response.success) {
            setNewUser(false);
            setLoginStatus(true, response.userId);
  
            // Navigate immediately after successful registration
            if (business.codRazSoc) {
              navigateToMenuIfId();
            } else {
              navigate('/');
            }
          }
        }
      }


    }catch(e){
      console.error('Error checking user:', e);
    }
  
  }

  
  //Navigate to /menu only if there's a valid id and business number
  const navigateToMenuIfId = () => {
    if (id && business) {
      navigate('/menu', { state: { razSoc: business.codRazSoc, businessNameFromLogIn: business.businessName} });
    }
  };

  // Handle new user registration
  // useEffect(() => {
  //   if (newUser && data.credential && phone) {
  //     handleResponse(data.credential, phone, setNewUser, setLoginStatus, setLoading, navigate, setBusinessNum, id, navigateToMenuIfId);
  //   }
  // }, [data, newUser, phone]);

  // Check if a user has been created and navigate to menu
  useEffect(() => {
    if (newUser === false && business) {
      navigateToMenuIfId(); // Navigate to menu if the user is no longer new and there's a business number
    }
  }, [newUser, business]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={style.loaderContainer}>
        <MoonLoader color="#4A90E2" size={50} aria-label="Loading spinner" />
      </div>
    );
  }

  return (
    <div className={style.container} aria-label="Login container">
      <LargeScreenNotice />
      {openModal && (
        <ModalOneButton
          message={ES_text.phone_modal}
          setFunction={setOpenModal}
          buttonText={ES_text.button_enter}
          stateSetter={setPhone}  // Set the phone number
        />
      )}

      <div className={style.login} aria-label="Login form">
        <div className={style.title} aria-label="Welcome Back!">
          <img src={'/public/images/malbec_logo_transparente.PNG'} className={style.logo} alt="Malbec Logo" />
        </div>

        {/* Show loader while the login process is happening */}
        {loginLoading ? (
          <div className={style.loaderContainer}>
            <MoonLoader color="red" size={60} aria-label="Loading spinner" />
          </div>
        ) : (
          <div className={style.formContainer} aria-label="Google login button container">
            
            <div>
              <legend className={style.legend} aria-label="Login form legend">login</legend>
                <div  className={style.inputContainer}>

                <input type='text' name='email' placeholder='email' onChange={(e)=>setEmail(e.target.value)} className={style.input}/>
                <input type='password' name='password'  placeholder='password'onChange={(e)=>setPassword(e.target.value)} className={style.input}/>
                <input type='password' name='password'  placeholder='repetir password'onChange={(e)=>setRepeatPassword(e.target.value)} className={newAccountMode ? style.input : style.inputHidden}/>
                </div>
              <button type='submit' onClick={!newAccountMode ? handleLogin : handleRegister} className={style.button}>{!newAccountMode ? 'login' : (!phone ? language.create_account_button : 'siguiente')}</button>
              <div className={!phone ? style.verificationMsgHidden : style.verificationMsg}>{language.verification_message}</div>
            </div>

            <p className={!phone ? style.createAccP : style.createAccPHidden}>{language.create_account_preface}<span onClick={()=>setNewAccountMode(!newAccountMode)}  className={style.createAccSpan}>{language.create_account_button}</span></p>

            <div className={style.loginBtnContainer}>
            <p className={style.createAccP}>{language.or_else}</p>
            <CustomGoogleLoginBtn handleGoogleLoginRegister={handleGoogleLoginRegister} setIsGoogleLogin={setIsGoogleLogin}/>
            </div>
          </div>
        )}
      </div>

      <footer className={style.footer}>
        <p>code by <a href='https://github.com/leandroatochkin'>leandroatochkin</a></p>
        <p>logos by <a href='https://www.instagram.com/andres_actis?igsh=dDA5ejYxbmVtOW51'>Blick Media Lab</a></p>
      </footer>
    </div>
  );
};

export default Login;

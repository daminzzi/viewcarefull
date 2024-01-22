/* eslint-disable operator-linebreak */
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../stores/userStore';
import api from '../services/api';

interface Form {
  name: string;
  phone1: string;
  phone2: string;
  phone3: string;
  birth: string;
}

function SignUp() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [form, setForm] = useState<Form>({
    name: '',
    phone1: '',
    phone2: '',
    phone3: '',
    birth: '',
  });

  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [vaildId, setValidId] = useState<boolean>(false);
  const [checkId, setCheckId] = useState<boolean>(false); // 아이디 중복 유무
  const [IdMsg, setIdMsg] = useState<string>('');
  const [validPw, setValidPw] = useState<boolean>(false);
  const [PwMsg, setPwMsg] = useState<string>('');
  const [PwConfirmMsg, setPwConfirmMsg] = useState<string>('');

  // id 유효성 검사
  function onChangeId(e: ChangeEvent<HTMLInputElement>) {
    const inputId = e.target.value;
    setId(inputId);
    const idRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;

    if (id.length === 0) {
      setIdMsg('');
    } else if (!idRegex.test(id)) {
      setIdMsg('3~20사이 대소문자 또는 숫자만 입력해 주세요!');
      setValidId(false);
    } else {
      setIdMsg('사용가능한 아이디 입니다.');
      setIdMsg('');
      setValidId(true);
    }
  }

  // 두 password 일치 확인
  function onChangePasswordConfirm(e: ChangeEvent<HTMLInputElement>) {
    const inputPasswordConfirm = e.target.value;
    setPasswordConfirm(inputPasswordConfirm);
    if (inputPasswordConfirm.length === 0) {
      setPwConfirmMsg('');
    } else if (password !== inputPasswordConfirm) {
      setPwConfirmMsg('두 비밀번호가 일치하지 않습니다.');
      setValidPw(false);
    } else {
      setPwConfirmMsg('두 비밀번호가 일치합니다.');
      setValidPw(true);
    }
  }

  // password 유효성 검사
  function onChangePassword(e: ChangeEvent<HTMLInputElement>) {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    const pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[@#$%^&+=!])(?!.*\s).{8,20}$/;

    if (inputPassword.length === 0) {
      setPwMsg('');
      setValidPw(false);
    } else if (!pwRegex.test(inputPassword)) {
      setPwMsg('8~20사이 숫자, 소문자, 특수문자 포함해서 입력해주세요!');
      setValidPw(false);
    } else {
      setPwMsg('사용가능한 비밀번호 입니다.');
      setValidPw(true);
    }

    if (password.length !== 0 && password !== passwordConfirm) {
      setPwConfirmMsg('두 비밀번호가 일치하지 않습니다.');
      setValidPw(false);
    } else if (password.length !== 0 && password === passwordConfirm) {
      setPwConfirmMsg('두 비밀번호가 일치합니다.');
      setValidPw(true);
    } else {
      setPwConfirmMsg('');
      setValidPw(false);
    }
  }

  // 회원가입 버튼 활성화 조건
  const submitRequirements =
    id &&
    password &&
    passwordConfirm &&
    vaildId &&
    validPw &&
    checkId &&
    form.name &&
    form.phone1 &&
    form.phone2 &&
    form.phone3 &&
    form.birth;

  // input태그의 이름, 사용자가 입력한 값을 실시간으로 각각 동적 할당
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  // 아이디 중복 확인
  async function handleCheckId() {
    try {
      const response = await api.get(`/users/validation/${id}`);
      if (response.status === 409) {
        alert('이미 사용 중인 아이디입니다.');
        setCheckId(false);
      } else {
        alert('사용 가능한 아이디입니다.');
        setCheckId(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (vaildId && checkId) {
      setIdMsg('사용 가능한 아이디입니다.');
    }
  }, [vaildId, checkId]);

  // 회원가입
  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const phoneNumber = `${form.phone1}-${form.phone2}-${form.phone3}`;
    try {
      const response = await axios({
        method: 'post',
        url: '/users',
        data: { ...form, phoneNumber, id, password },
      });

      if (response.status === 201) {
        setUser(response.data);
        navigate('/login');
      } else {
        console.error(`오류: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>회원가입</h1>
      <form onSubmit={handleSignUp}>
        <label>
          아이디:
          <input
            type="text"
            name="id"
            value={id}
            onChange={onChangeId}
            required
          />
          <button type="button" onClick={handleCheckId}>
            중복확인
          </button>
          <p className="message">{IdMsg}</p>
        </label>
        <br />
        <label>
          비밀번호:
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChangePassword}
            required
          />
          <p className="message">{PwMsg}</p>
        </label>
        <br />
        <label>
          비밀번호 확인:
          <input
            type="password"
            name="passwordConfirm"
            value={passwordConfirm}
            onChange={onChangePasswordConfirm}
            required
          />
          <p className="message">{PwConfirmMsg}</p>
        </label>
        <br />
        <label>
          이름:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          전화번호:
          <input
            type="tel"
            name="phone1"
            value={form.phone1}
            onChange={handleChange}
            required
            maxLength={3}
          />
          -
          <input
            type="tel"
            name="phone2"
            value={form.phone2}
            onChange={handleChange}
            required
            maxLength={4}
          />
          -
          <input
            type="tel"
            name="phone3"
            value={form.phone3}
            onChange={handleChange}
            required
            maxLength={4}
          />
        </label>
        <br />
        <label>
          생년월일:
          <input
            type="date"
            name="birth"
            value={form.birth}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={!submitRequirements}>
          회원가입
        </button>
      </form>
    </div>
  );
}

export default SignUp;

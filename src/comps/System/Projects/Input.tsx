import React from 'react';
interface InputProps {
    colorVal: string;
    type: string;
    name: string;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }

const Input = ({ name, value, placeholder, onChange, colorVal }: InputProps) => {
  return (
    <input
    style={{color: colorVal}}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
      ></input>
  );
};

export default Input;
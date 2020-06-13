import React from "react";
import { useForm } from "react-hook-form";
import { auth } from "../services/firebase";

interface formProps {
  onSubmit(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential>;
}

const Form: React.FC<formProps> = (props) => {
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = (e: any) => {
    props.onSubmit(e.email, e.username);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="email"
        ref={register({
          required: "Required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            message: "invalid email address",
          },
        })}
      />
      {errors.email && errors.email.message}

      <input
        name="username"
        ref={register({
          validate: (value) => value !== "admin" || "Nice try!",
        })}
      />
      {errors.username && errors.username.message}

      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;

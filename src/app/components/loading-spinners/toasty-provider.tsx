"use client";
import React from "react";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

type Props = object;

export default function ToastyProvider({}: Props) {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Slide}
      className="w-full"
      style={{ maxWidth: "562px" }}
      closeButton={
        <X className="size-6 text-_white toast-close-icon mt-5 mr-4" />
      }
    />
  );
}

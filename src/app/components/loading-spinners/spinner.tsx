"use client";
import React from "react";


const Spinner = () => {
  return (
    <div id="preloader">
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

type Props = {
  loading: boolean;
};
export function LoadingBar({ loading }: Props) {
  return loading ? (
    <div className="bar__">
      <div></div>
    </div>
  ) : (
    <></>
  );
}

export const LoadingSpinner = ({ loading }: Props) => {
  return loading ? (
    <div id="preloader">
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export function UploadingBar({ loading }: Props) {
  return loading ? (
    <div className="position-relative">
      <h6 className="uploading-progress-text">Uploading...</h6>
      <div className="bar__ upload-progress">
        <div></div>
      </div>
    </div>
  ) : null;
}

export default Spinner;

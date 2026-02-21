import actionCreators from "@/store/actionCreators";
import { bindActionCreators } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

export const useActions = () => bindActionCreators(actionCreators, useDispatch());

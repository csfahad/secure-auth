import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const register = async (req: Request, res: Response) => {
    console.log(`register controller`);
};

export const login = async (req: Request, res: Response) => {
    console.log(`login controller`);
};

export const logout = async (req: Request, res: Response) => {
    console.log(`logout controller`);
};

const { userModel } = require("../db") // from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken")

const userAuthService = {
  addUser: async ({ nickname, email, password }) => {
    const user = await userModel.findByEmail({ email })
    if (user) {
      throw new Error(
        "이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요."
      )
    }

    // 비밀번호 해쉬화
    const hashedPassword = await bcrypt.hash(password, 10)
    const id = uuidv4()
    const newUser = { id, nickname, email, password: hashedPassword }

    // db에 저장
    const createdNewUser = await userModel.create({ newUser })
    createdNewUser.errorMessage = null // 문제 없이 db 저장 완료되었으므로 에러가 없음.

    return createdNewUser
  },

  getUser: async ({ email, password }) => {
    const user = await userModel.findByEmail({ email })
    if (!user) {
      throw new Error(
        "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요."
      )
    }

    // 비밀번호 일치 여부 확인
    const correctPasswordHash = user.password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      correctPasswordHash
    )
    if (!isPasswordCorrect) {
      throw new Error("비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.")
    }

    // 로그인 성공 -> JWT 웹 토큰 생성
    const secretKey = process.env.JWT_SECRET_KEY || "jwt-secret-key"
    const token = jwt.sign({ userId: user.id }, secretKey)

    // 반환할 loginuser 객체를 위한 변수 설정
    const id = user.id
    const name = user.name
    const description = user.description

    const loginUser = {
      token,
      id,
      email,
      name,
      description,
      errorMessage: null,
    }

    return loginUser
  },

  getUsers: async () => {
    const users = await userModel.findAll()
    return users
  },

  setUser: async ({ userId, toUpdate }) => {
    // 우선 해당 id 의 유저가 db에 존재하는지 여부 확인
    let user = await userModel.findById({ userId })

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.")
    }

    // 업데이트 대상에 name이 있다면, 즉 name 값이 null 이 아니라면 업데이트 진행
    if (toUpdate.name) {
      const fieldToUpdate = "name"
      const newValue = toUpdate.name
      user = await User.update({ userId, fieldToUpdate, newValue })
    }

    if (toUpdate.email) {
      const fieldToUpdate = "email"
      const newValue = toUpdate.email
      user = await User.update({ userId, fieldToUpdate, newValue })
    }

    if (toUpdate.password) {
      const fieldToUpdate = "password"
      const newValue = toUpdate.password
      user = await User.update({ userId, fieldToUpdate, newValue })
    }

    if (toUpdate.description) {
      const fieldToUpdate = "description"
      const newValue = toUpdate.description
      user = await User.update({ userId, fieldToUpdate, newValue })
    }

    return user
  },

  getUserInfo: async ({ userId }) => {
    const user = await userModel.findById({ userId })

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      throw new Error(
        "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요."
      )
    }

    return user
  },
}

module.exports = { userAuthService }

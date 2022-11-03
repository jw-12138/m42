let basePath = "http://localhost:5008"

export default {
  createRoom: basePath + '/createRoom',
  enterRoom: basePath + '/enterRoom',
  checkRoom: basePath + '/checkRoom',
  sendMessage: basePath + '/sendMessage',
  updateRoom: basePath + '/updateRoom',
  checkOnline: basePath + '/checkOnline',
}
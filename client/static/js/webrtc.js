// Tập lệnh WebRTC logic

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};
let peerConnection = new RTCPeerConnection(configuration);

const socket = io.connect();  // Kết nối tới server signaling

// Lắng nghe sự kiện từ server
socket.on('offer', async (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async (candidate) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Gửi offer
async function startCall() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
}

// Gửi ICE Candidate
peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
        socket.emit('candidate', candidate);
    }
};

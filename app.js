let localStream;
let remoteStream;
let localPeerConnection;
let remotePeerConnection;

const startCall = async () => {
    try {
        // カメラとマイクのストリームを取得
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // ローカルビデオ要素にストリームを割り当て
        document.getElementById("localVideo").srcObject = localStream;

        // Peer Connection の設定
        const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
        localPeerConnection = new RTCPeerConnection(configuration);
        remotePeerConnection = new RTCPeerConnection(configuration);

        // ローカル Peer Connection にストリームを追加
        localStream.getTracks().forEach(track => localPeerConnection.addTrack(track, localStream));

        // リモート Peer Connection にイベントリスナーを追加
        remotePeerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            document.getElementById("remoteVideo").srcObject = remoteStream;
        };

        // ICE Candidate の交換を設定
        localPeerConnection.onicecandidate = event => {
            if (event.candidate) {
                remotePeerConnection.addIceCandidate(event.candidate);
            }
        };

        remotePeerConnection.onicecandidate = event => {
            if (event.candidate) {
                localPeerConnection.addIceCandidate(event.candidate);
            }
        };

        // Offer を生成
        const offer = await localPeerConnection.createOffer();
        await localPeerConnection.setLocalDescription(offer);
        await remotePeerConnection.setRemoteDescription(offer);

        // Answer を生成
        const answer = await remotePeerConnection.createAnswer();
        await remotePeerConnection.setLocalDescription(answer);
        await localPeerConnection.setRemoteDescription(answer);
    } catch (error) {
        console.error("Error starting the call:", error);
    }
};

const endCall = () => {
    localPeerConnection.close();
    remotePeerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
};

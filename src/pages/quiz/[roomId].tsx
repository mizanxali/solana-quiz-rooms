import { Flex } from "@chakra-ui/react";
import {
  useAcl,
  useAudio,
  useEventListener,
  useLobby,
  usePeers,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { useClient, useWallet } from "@wallet01/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getMessage, getSolanaAccessToken } from "@huddle01/auth";
import { useHuddle01 } from "@huddle01/react";
import { Video, Audio } from "@huddle01/react/components";
import { useAppUtils } from "@huddle01/react/app-utils";

export default function Quiz() {
  const router = useRouter();
  const { roomId } = router.query;

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [otherRaisedHands, setOtherRaisedHands] = useState<string[]>([]);

  //wallet01 hooks
  const { connectors } = useClient();
  const { address } = useWallet();

  //huddle01 hooks
  const { roomState, me } = useHuddle01();
  const { joinLobby } = useLobby();
  const { joinRoom } = useRoom();
  const {
    fetchVideoStream,
    stopVideoStream,
    error: camError,
    produceVideo,
    stopProducingVideo,
    stream: camStream,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    error: micError,
    produceAudio,
    stopProducingAudio,
    stream: micStream,
  } = useAudio();
  const { sendData } = useAppUtils();
  const { peers } = usePeers();
  // const { leaveRoom } = useRoom();
  const { changePeerRole, changeRoomControls, changePeerControls, kickPeer } =
    useAcl();

  useEffect(() => {
    if (!roomId) return;
    joinHuddle01Room();
  }, [roomId]);

  useEffect(() => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  }, [camStream, videoRef.current]);

  // useEffect(() => {
  //   if (me.role === "host") changeRoomControls("audioLocked", true);
  // }, [me.role]);

  //auto-join room as soon as user enters Huddle01 lobby
  useEventListener("lobby:joined", async () => {
    await fetchVideoStream();
    joinRoom();
  });

  useEventListener("app:cam-on", async (stream) => {
    await produceVideo(stream);
  });

  useEventListener("app:mic-on", async (stream) => {
    await produceAudio(stream);
  });

  const joinHuddle01Room = async () => {
    const msg = await getMessage(address as string);
    const _message = new TextEncoder().encode(msg.message);
    const { signature: sig } = await connectors[0].provider.signMessage(
      _message
    );
    const token = await getSolanaAccessToken(
      JSON.stringify(sig),
      address as string
    );
    await joinLobby(roomId as string, token.accessToken);
  };

  useEventListener("room:data-received", ({ fromPeerId, payload }) => {
    //show hand raise
    const raisedHands = [...otherRaisedHands];
    if (payload.handRaise) {
      raisedHands.push(fromPeerId);
      setOtherRaisedHands([...raisedHands]);
    } else {
      const removeIndex = raisedHands.findIndex((i) => i === fromPeerId);
      if (removeIndex > -1) raisedHands.splice(removeIndex, 1);
      setOtherRaisedHands([...raisedHands]);
    }
  });

  const onRaiseHand = () => {
    // Here "*" represents all peers in the room
    sendData("*", { handRaise: !isHandRaised });
    setIsHandRaised(!isHandRaised);
  };

  const toggleMicHandler = async () => {
    if (isMicOn) {
      await stopAudioStream();
      setIsMicOn(false);
    } else {
      await fetchAudioStream();
      setIsMicOn(true);
    }
  };

  return (
    <>
      <Flex
        gap="1rem"
        bg="#05070D"
        align="center"
        flexFlow="column"
        minH="100vh"
        h="100%"
      >
        <div>{roomState}</div>
        {/* <div>{JSON.stringify(me)}</div> */}

        <div className="w-full h-full flex flex-col items-center">
          <h1 className="text-center">Host</h1>
          <div className="w-full flex justify-center items-center">
            {me && me.role === "host" && (
              <div className="flex flex-col gap-2">
                <div>You</div>
                <video
                  width={200}
                  height={200}
                  ref={videoRef}
                  autoPlay
                  muted
                ></video>
              </div>
            )}
            {Object.values(peers)
              .filter(({ role }) => role === "host")
              .map(({ peerId, cam, mic }) => {
                return (
                  <div className="flex flex-col gap-2">
                    <div key={peerId}>{peerId}</div>
                    {cam && (
                      <Video
                        className="w-44 h-44"
                        peerId={peerId}
                        track={cam}
                      />
                    )}
                    {mic && (
                      <Audio
                        className="w-44 h-44"
                        peerId={peerId}
                        track={mic}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          <h1 className="text-center">Participants</h1>
          <div className="w-full flex flex-row gap-2 justify-center items-center">
            {me && me.role !== "host" && (
              <div className="flex flex-col gap-2">
                <div>You</div>
                <video
                  width={200}
                  height={200}
                  ref={videoRef}
                  autoPlay
                  muted
                ></video>
              </div>
            )}
            {Object.values(peers)
              .filter(({ role }) => role !== "host")
              .map(({ peerId, cam, role, mic }) => {
                return (
                  <div className="flex-col gap-2">
                    <div>{peerId}</div>
                    {cam && (
                      <Video
                        className="w-44 h-44"
                        peerId={peerId}
                        track={cam}
                      />
                    )}
                    {mic && (
                      <Audio
                        className="w-44 h-44"
                        peerId={peerId}
                        track={mic}
                      />
                    )}
                    {otherRaisedHands.includes(peerId) && (
                      <span>Hand Raised</span>
                    )}
                    <div>
                      {me.role === "host" && role !== "coHost" && (
                        <button
                          onClick={() => {
                            changePeerRole(peerId, "coHost");
                          }}
                        >
                          Make Speaker
                        </button>
                      )}
                    </div>
                    <div>
                      {me.role === "host" && role === "coHost" && (
                        <button
                          onClick={() => {
                            changePeerRole(peerId, "peer");
                          }}
                        >
                          Remove Speaker
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* <div className="flex w-full px-10 justify-center">
          <button onClick={() => console.log(peers)}>Log Peers</button>
        </div> */}
        {me.role !== "peer" && (
          <div className="flex w-full px-10 justify-center">
            <button onClick={toggleMicHandler}>Toggle Mic</button>
          </div>
        )}
        {me.role !== "host" && (
          <div className="flex w-full px-10 justify-center">
            <button onClick={onRaiseHand}>
              {isHandRaised ? "Lower Hand" : "Raise Hand"}
            </button>
          </div>
        )}
        {/* <button
          onClick={() => {
            // leaveRoom();
            router.push("/");
          }}
        >
          Leave Room
        </button> */}
      </Flex>
    </>
  );
}

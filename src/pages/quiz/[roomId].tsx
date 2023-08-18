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
import { useEffect, useRef } from "react";
import { getMessage, getSolanaAccessToken } from "@huddle01/auth";
import { useHuddle01 } from "@huddle01/react";
import { Video, Audio } from "@huddle01/react/components";
import { useAppUtils } from "@huddle01/react/app-utils";

export default function Quiz() {
  const router = useRouter();
  const { roomId } = router.query;

  const videoRef = useRef<HTMLVideoElement>(null);

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
  const { sendData } = useAppUtils();
  const { peers } = usePeers();
  const { leaveRoom } = useRoom();
  const { changePeerRole, changeRoomControls, changePeerControls, kickPeer } =
    useAcl();

  useEffect(() => {
    if (!roomId) return;
    joinHuddle01Room();
  }, [roomId]);

  useEffect(() => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  }, [camStream, videoRef.current]);

  useEffect(() => {
    if (me.role === "host") changeRoomControls("audioLocked", true);
  }, [me.role]);

  //auto-join room as soon as user enters Huddle01 lobby
  useEventListener("lobby:joined", async () => {
    await fetchVideoStream();
    joinRoom();
  });

  useEventListener("room:joined", async () => {
    await produceVideo(camStream);
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
  });

  const sendReaction = (emoji: any) => {
    // Here "*" represents all peers in the room
    sendData("*", { emoji: emoji });
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
        <div>{JSON.stringify(me)}</div>
        <div className="flex w-full h-full">
          <div className="w-1/2">
            <h1>Host</h1>
            {me && me.role === "host" && (
              <video
                width={384}
                height={384}
                ref={videoRef}
                autoPlay
                muted
              ></video>
            )}
            {Object.values(peers)
              .filter(({ role }) => role === "host")
              .map(({ peerId, cam }) => {
                return (
                  <>
                    <div key={peerId}>{peerId}</div>
                    {cam && (
                      <Video
                        className="w-96 h-96"
                        peerId={peerId}
                        track={cam}
                      />
                    )}
                  </>
                );
              })}
          </div>
          <div className="w-1/2 flex flex-col gap-2">
            {Object.values(peers)
              .filter(({ role }) => role !== "host")
              .map(({ peerId, cam }) => {
                return (
                  <div
                    onClick={() => {
                      if (me.role === "host") changePeerRole(peerId, "coHost");
                    }}
                  >
                    <div key={peerId}>{peerId}</div>
                    {cam && (
                      <Video
                        className="w-96 h-96"
                        peerId={peerId}
                        track={cam}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        {/* {me.role === "host" && (
          <div className="flex flex-col gap-2">
            <h6>Host Controls</h6>
            <button
              onClick={() => {
                changeRoomControls("audioLocked", true);
              }}
            >
              Disallow Audio
            </button>
          </div>
        )} */}

        <button
          onClick={() => {
            console.log(camStream);
            sendReaction("okokoklalala");
          }}
        >
          Log peers
        </button>
        <button
          onClick={() => {
            leaveRoom();
            router.push("/");
          }}
        >
          Leave Room
        </button>
      </Flex>
    </>
  );
}

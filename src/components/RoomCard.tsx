import { useWallet } from "@wallet01/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface RoomCardProps {
  roomId: string;
}

interface RoomDetails {
  roomId: string;
  hostWalletAddress: string[];
  title: string;
  meetingLink: string;
}

function RoomCard({ roomId }: RoomCardProps) {
  const router = useRouter();

  //wallet01 hooks
  const { address } = useWallet();

  const [roomDetails, setRoomDetails] = useState<RoomDetails>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchMeetingDetails();
  }, []);

  const fetchMeetingDetails = async () => {
    const res = await fetch(`/api/meeting-details?roomId=${roomId}`);
    const data = await res.json();
    setRoomDetails(data);
    setIsLoading(false);
  };

  const joinQuizRoom = async () => {
    router.push(`/quiz/${roomId}`);
    return;
  };

  if (isLoading || !roomDetails) return null;

  return (
    <div className="rounded-lg bg-gray-900 px-3 py-2 text-center text-white">
      <h1 className="font-semibold text-lg">{roomDetails.title}</h1>
      <h1 className="font-semibold text-lg">{roomId}</h1>
      <h3 className="mt-2">
        Hosted by
        <br />
        {roomDetails.hostWalletAddress[0]}
      </h3>
      {address && (
        <button
          onClick={joinQuizRoom}
          className="mt-2 font-semibold rounded-lg px-2 py-2 bg-gray-700"
        >
          Join
        </button>
      )}
    </div>
  );
}

export default RoomCard;

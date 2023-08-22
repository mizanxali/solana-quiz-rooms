import RoomCard from "@/components/RoomCard";
import WalletBtn from "@/components/WalletBtn";
import { ROOMS } from "@/util/constants";
import { Flex } from "@chakra-ui/react";

export default function Home() {
  const createQuizRoom = async () => {
    const res = await fetch("/api/create-room");
    const data = await res.json();
    console.log(data);
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
        <WalletBtn />
        {/* <button onClick={createQuizRoom}>create room</button> */}
        <div className="mt-6 justify-center flex gap-4 flex-wrap">
          {ROOMS.map((room) => (
            <RoomCard key={room} roomId={room} />
          ))}
        </div>
      </Flex>
    </>
  );
}

import axios from "axios";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { data } = await axios.post(
      "https://api.huddle01.com/api/v1/create-room",
      {
        title: "Science Quiz Room",
        roomLock: false,
        hostWallets: ["3EHmgggERLXCCMtgBeQ1bTYRLCMrUXxgcfPomhyTsby2"],
        // description:
        //   "Unleash your curiosity and test your scientific savvy in this thrilling Science Quiz! From atoms to galaxies, challenge your knowledge across the realms of science.",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY,
        },
      }
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;

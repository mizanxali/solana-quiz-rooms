import axios from "axios";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { data } = await axios.get(
      `https://api.huddle01.com/api/v1/meeting-details/${req.query.roomId}`,
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

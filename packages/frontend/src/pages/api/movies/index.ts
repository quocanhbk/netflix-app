import { NextApiRequest, NextApiResponse } from 'next';

import prismadb from 'src/lib/prismadb';
import serverAuth from 'src/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    await serverAuth(req);

    const movies = await prismadb.movie.findMany();

    return res.status(200).json(movies);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}

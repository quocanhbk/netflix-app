import { without } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

import prismadb from 'src/lib/prismadb';
import serverAuth from 'src/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST' || req.method === 'DELETE') {
      const { currentUser } = await serverAuth(req, res);

      console.log('hellloFavorite');

      const { movieId } = req.body;

      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId,
        },
      });

      if (!existingMovie) {
        throw new Error('Invalid ID');
      }

      const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);

      const updatedUser = await prismadb.user.update({
        where: {
          email: currentUser.email || '',
        },
        data: {
          favoriteIds:
            req.method === 'POST'
              ? {
                  push: movieId,
                }
              : updatedFavoriteIds,
        },
      });

      return res.status(200).json(updatedUser);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}

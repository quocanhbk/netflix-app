import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@api/auth/[...nextauth]';

import prismadb from './prismadb';

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  console.log('req: ', req.body);

  console.log('method: ', req.method);
  console.log('session: ', session);

  if (!session?.user?.email) {
    console.log(session);
    throw new Error('Not signed in');
  }

  const currentUser = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  console.log('currentUser: ', currentUser);
  if (!currentUser) {
    throw new Error('Not signed in');
  }

  return { currentUser };
};

export default serverAuth;

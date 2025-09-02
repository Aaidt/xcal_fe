import axios from 'axios';
import { useSession } from 'next-auth/react';

axios.interceptors.request.use(config => {
  const { data: session } = useSession();
  //@ts-ignore
  if (session?.user.id) config.headers.Authorization = `Bearer ${session?.user.id}`;
  return config;
});

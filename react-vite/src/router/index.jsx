import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import MusicPlayerPage from "../components/MusicPlayerPage";
import UploadSongPage from "../components/UploadSongPage";
import ListeningHistoryPage from "../components/ListeningHistoryPage";
import HomePage from "../components/HomePage";
import Layout from './Layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: 'songs',
        element: <MusicPlayerPage />,
      },
      {
        path: 'upload',
        element: <UploadSongPage />,
      },
      {
        path: 'history',
        element: <ListeningHistoryPage />,
      }
    ],
  },
]);
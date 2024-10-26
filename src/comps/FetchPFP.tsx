import React, { useEffect, useState } from 'react';
import IsLoggedIn from '../firebase/IsLoggedIn';
import { supabase } from '../supabase/supabaseClient';
import userNoProfile from '../assets/UserNoProfile.jpg';
import Loader from './Loader';

interface pubsType {
    publicUrl: string;
}

interface userUid {
    userUid: any;
}

const FetchPFP: React.FC<userUid> = ({ userUid }) => {
    const [user] = IsLoggedIn();
    const [imageUrl, setImageUrl] = useState<pubsType | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchImage = async () => {
        if (!user) return;
        try {
            // Check if the profile picture exists in the specified folder
            const { data: files, error: listError } = await supabase
                .storage
                .from('profile')
                .list(`images/${userUid}`, { limit: 1, search: 'profile_picture.jpg' });

            if (listError || !files || files.length === 0) {
                console.log('Profile picture not found.');
                setImageUrl(null);
            } else {
                // Get the public URL if the profile picture exists
                const { data: publicData, error: urlError }:any = supabase
                    .storage
                    .from('profile')
                    .getPublicUrl(`images/${userUid}/profile_picture.jpg`);

                if (urlError) {
                    console.error('Error getting public URL:', urlError.message);
                    setImageUrl(null);
                } else {
                    setImageUrl({ publicUrl: `${publicData.publicUrl}?t=${Date.now()}` });
                }
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchImage();
        }
    }, [user, userUid]);

    return (
        <>
            {loading ? (
                <div className='w-[15px] h-[15px]'>
                    <Loader />
                </div>
            ) : (
                <img
                    src={imageUrl?.publicUrl || userNoProfile}
                    className='w-full h-full object-cover'
                    alt="User Profile"
                />
            )}
        </>
    );
};

export default FetchPFP;

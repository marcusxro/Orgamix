import React, { useEffect, useState } from 'react';
import { firebaseAuthKey } from './FirebaseKey';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const IsLoggedIn = (): [User | null, React.Dispatch<React.SetStateAction<User | null>>] => {
    const [user, setUser] = useState<User | null>(null);
    const nav = useNavigate()
    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuthKey, (userCred) => {
            if (userCred?.emailVerified) {
                setUser(userCred); // Set the user or null
            } else {
                setUser(null)
                nav('/sign-in')
            }
        });

        return () => unsub(); // Cleanup subscription on component unmount
    }, [user]);

    return [user, setUser];
}

export default IsLoggedIn;
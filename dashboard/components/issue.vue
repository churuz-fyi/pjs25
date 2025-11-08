import PocketBase from 'pocketbase';

const pb = new PocketBase('https://127.0.0.1:8090');

const record = await pb.collection('reports').getOne('RECROD_ID', 
{expand:'relField1,relField2.subRelField',});


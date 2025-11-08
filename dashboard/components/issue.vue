import PocketBase from 'pocketbase';

const pb = new PocketBase('https://127.0.0.1:8090');

const record = await pb.collection('reports').getOne('RECORD_ID', 
{expand:'relField1,relField2.subRelField',});

const email = record.email;
const url = record.url;
const issue = record.issue;


return (
    <div>
        <p>Email: {record.email}</p>
        <p>URL: <a href={record.url}</a></p>
        <p>Issue: {record.issue}</p>
    </div>
);
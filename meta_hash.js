import { createHash } from "crypto";
import fsp from "fs/promises";
import path from "path";

//-----------------------------------------------------
//Returns a buffer with a computed hash of all file's metadata:
//full path, modification time and filesize
//If you pass inputHash, it must be a Hash object from the crypto library
//and you must then call .digest() on it yourself when you're done
//If you don't pass inputHash, then one will be created automatically
//and the digest will be returned to you in a Buffer object
//-----------------------------------------------------

export async function computeMetaHash(folder, inputHash = null) {
	const hash = inputHash ? inputHash : createHash("sha256");
	const info = await fsp.readdir(folder, { withFileTypes: true });
	//construct a string from the modification date, the filename and the filesize
	for (const item of info) {
		const fullPath = path.join(folder, item.name);
		if (item.isFile()) {
			const statInfo = await fsp.stat(fullPath);
			//compute hash string name:size:mtime
			const fileInfo = `${fullPath}:${statInfo.size}:${statInfo.mtimeMs}`;
			hash.update(fileInfo);
		} else if (item.isDirectory()) {
			//recursively walk sub-folders
			await computeMetaHash(fullPath, hash);
		}
	}
	//if not being called recursively, get the digest and return it as the hash result
	if (!inputHash)
		return hash.digest();

}
//Stole this from StackOverflow, thanks person.
//https://stackoverflow.com/a/68075276
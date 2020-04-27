<?php

// make surte the config has been included
require_once ('config.php');

//connect to the db
$db = new mysqli(db_host, db_user, db_passwd, db_name);

if (mysqli_connect_errno()) {
	if (DEBUG) {
		echo "bad tings have happened";
		throw new Exception('Error connecting to MySQL: ' . $db -> error);
		echo "<hr/>";
	}
} else {
	if (DEBUG) {
		echo "db connected  !<hr/>";
	}

}
?>
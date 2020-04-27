<?php
require_once ('config.php');
require_once ('db.php');


if(!(isset($_GET['lat']) && isset($_GET['lng']))){

  echo "lat lng ?";
  exit;
}

$radius = (isset($_GET['radius']) ? $_GET['radius'] : $default_radius)/1000;


$lat = mysqli_real_escape_string($db, $_GET['lat']);
$lng = mysqli_real_escape_string($db, $_GET['lng']);
$table = mysqli_real_escape_string($db, $_GET['table']);
$radius = mysqli_real_escape_string($db, $radius);

//$table ='sites';
//$table ='niah';
//$table ='smr';

$query = "
SELECT * FROM (
        SELECT *,
            (
                (
                    (
                        acos(
                            sin(( $lat * pi() / 180))
                            *
                            sin(( `lat` * pi() / 180)) + cos(( $lat * pi() /180 ))
                            *
                            cos(( `lat` * pi() / 180)) * cos((( $lng - `lng`) * pi()/180)))
                    ) * 180/pi()
                ) * 60 * 1.1515 * 1.609344
            )
        as distance FROM `$table`
    ) $table
    WHERE distance <= $radius";
// echo $query;
//     exit;

$result = $db->query($query);
if (!$result) {
    echo "An SQL error occured.\n";
    exit;
}

//echo $query ;

$shrines = array();
while($row = $result->fetch_assoc()) {
  //var_dump($row);
    $shrines[] = $row;
}

header('Content-Type: application/json');
print json_encode($shrines, 512, JSON_UNESCAPED_UNICODE);
$db = NULL;
?>

<?php

namespace App\Enums;

enum AlertType: string
{
   case WARNING = 'WARNING';
   case PROMO = 'PROMO';
   case INFO = 'INFO';
}
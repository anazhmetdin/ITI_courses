﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _3GameStrategy
{
    internal class DefendStrategy: TeamStrategy
    {
        public override void play()
        {
            Console.WriteLine("Defending");
        }
    }
}
